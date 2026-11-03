export type CepData = { street: string; district: string; city: string; state: string };

// Busca opcional no ViaCEP. Qualquer problema (CEP incompleto, inexistente, serviço fora do ar, sem rede)
// devolve null, e o formulário simplesmente deixa o usuário preencher à mão.
export async function lookupCep(cep: string): Promise<CepData | null> {
  const digitos = cep.replaceAll(/\D/g, "");
  if (digitos.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    if (dados.erro) return null;
    return { street: dados.logradouro ?? "", district: dados.bairro ?? "", city: dados.localidade ?? "", state: dados.uf ?? "" };
  } catch {
    return null;
  }
}
