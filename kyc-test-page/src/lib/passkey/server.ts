export async function getContractId({ keyId }: { keyId: string }) {
  const res = await fetch("/api/mercury/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "getContractId", keyId }),
  });
  if (!res.ok) {
    throw new Error(`getContractId failed: ${res.status}`);
  }
  return res.json();
}

export async function send(signedTx: string) {
  const res = await fetch("/api/mercury/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "send", signedTx }),
  });
  if (!res.ok) {
    throw new Error(`send failed: ${res.status}`);
  }
  return res.json();
}
