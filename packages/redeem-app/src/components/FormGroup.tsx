type FormGroupProps = {
  children: React.ReactNode
}

export function FormGroup({ children, ...props }: FormGroupProps) {
  return (
    <div className='form-group' {...props}>
      {children}
    </div>
  )
}
