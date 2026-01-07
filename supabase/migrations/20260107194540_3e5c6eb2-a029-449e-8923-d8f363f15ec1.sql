-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create app_status enum for job status
CREATE TYPE public.job_status AS ENUM ('open', 'assigned', 'approved', 'completed', 'cancelled');

-- Create job categories enum
CREATE TYPE public.job_category AS ENUM (
  'limpieza', 
  'reparaciones', 
  'mudanzas', 
  'jardineria', 
  'cuidado_personas', 
  'clases', 
  'tecnologia', 
  'otros'
);

-- Create provinces enum (Spanish provinces)
CREATE TYPE public.province AS ENUM (
  'alava', 'albacete', 'alicante', 'almeria', 'asturias', 'avila', 'badajoz', 'barcelona',
  'burgos', 'caceres', 'cadiz', 'cantabria', 'castellon', 'ciudad_real', 'cordoba', 'cuenca',
  'girona', 'granada', 'guadalajara', 'guipuzcoa', 'huelva', 'huesca', 'islas_baleares',
  'jaen', 'la_coruna', 'la_rioja', 'las_palmas', 'leon', 'lleida', 'lugo', 'madrid', 'malaga',
  'murcia', 'navarra', 'ourense', 'palencia', 'pontevedra', 'salamanca', 'santa_cruz_tenerife',
  'segovia', 'sevilla', 'soria', 'tarragona', 'teruel', 'toledo', 'valencia', 'valladolid',
  'vizcaya', 'zamora', 'zaragoza', 'ceuta', 'melilla'
);

-- Create account_status enum
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dni_nie TEXT,
  birth_date DATE,
  address TEXT,
  province province,
  email TEXT NOT NULL,
  phone TEXT,
  payment_method TEXT,
  collection_method TEXT,
  account_status account_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category job_category NOT NULL,
  province province NOT NULL,
  estimated_date DATE,
  budget DECIMAL(10, 2) NOT NULL,
  status job_status DEFAULT 'open' NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (job_id, applicant_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Jobs policies
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create jobs" ON public.jobs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = publisher_id);

CREATE POLICY "Users can update own unassigned jobs" ON public.jobs
  FOR UPDATE TO authenticated 
  USING (auth.uid() = publisher_id AND status = 'open');

CREATE POLICY "Admins can update any job" ON public.jobs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Job applications policies
CREATE POLICY "Applicants can view own applications" ON public.job_applications
  FOR SELECT TO authenticated USING (auth.uid() = applicant_id);

CREATE POLICY "Publishers can view applications to their jobs" ON public.job_applications
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.publisher_id = auth.uid()
  ));

CREATE POLICY "Users can apply to jobs" ON public.job_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Admins can view all applications" ON public.job_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();