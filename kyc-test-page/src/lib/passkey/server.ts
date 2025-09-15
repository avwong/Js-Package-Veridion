export async function getContractId({ keyId }: { keyId: string }) {
  const mercuryUrl = process.env.NEXT_PUBLIC_MERCURY_URL;
  const mercuryJwt = process.env.NEXT_PUBLIC_MERCURY_JWT;

  if (!mercuryUrl || !mercuryJwt) {
    throw new Error(
      "Mercury configuration missing. Please set NEXT_PUBLIC_MERCURY_URL and NEXT_PUBLIC_MERCURY_JWT"
    );
  }

  const res = await fetch(`${mercuryUrl}/zephyr/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mercuryJwt}`,
    },
    body: JSON.stringify({ op: "getContractId", keyId }),
  });
  if (!res.ok) {
    throw new Error(`getContractId failed: ${res.status}`);
  }
  return res.json();
}

export async function send(signedTx: string) {
  const mercuryUrl = process.env.NEXT_PUBLIC_MERCURY_URL;
  const mercuryJwt = process.env.NEXT_PUBLIC_MERCURY_JWT;

  if (!mercuryUrl || !mercuryJwt) {
    throw new Error(
      "Mercury configuration missing. Please set NEXT_PUBLIC_MERCURY_URL and NEXT_PUBLIC_MERCURY_JWT"
    );
  }

  const res = await fetch(`${mercuryUrl}/zephyr/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mercuryJwt}`,
    },
    body: JSON.stringify({ op: "send", signedTx }),
  });
  if (!res.ok) {
    throw new Error(`send failed: ${res.status}`);
  }
  return res.json();
}
