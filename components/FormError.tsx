// Mensagem de erro de formulário. Usada nas telas de cadastro e login (feedback de erro).
export default function FormError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;

  return (
    <p role="alert" className="form-error">
      {message}
    </p>
  );
}
