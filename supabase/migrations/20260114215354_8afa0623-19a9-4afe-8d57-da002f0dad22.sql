-- Allow admins to delete jobs
CREATE POLICY "Admins can delete any job" 
ON public.jobs 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete job applications
CREATE POLICY "Admins can delete applications" 
ON public.job_applications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update job applications status
CREATE POLICY "Admins can update applications" 
ON public.job_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));