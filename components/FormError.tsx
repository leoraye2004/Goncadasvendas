// Mensagem de erro de formulário. Usada nas telas de cadastro e login (feedback de erro).
export default function FormError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;

  return (
    <p role="alert" className="text-sm text-red-600">
      {message}
    </p>
  );
}
