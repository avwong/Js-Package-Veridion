// Backend API types and functions

export interface BuildRegisterTransactionDto {
  wallet: string;
  name: string;
  surnames: string;
  sourceAccount: string;
}

export interface BuildRegisterTransactionResponse {
  success: boolean;
  message?: string;
  xdr?: string;
  sourceAccount?: string;
  sequence?: string;
  fee?: string;
  timebounds?: {
    minTime: string;
    maxTime: string;
  };
  footprint?: string;
  error?: string;
}

export interface SubmitSignedTransactionDto {
  signedXdr: string;
}

export interface SubmitSignedTransactionResponse {
  success: boolean;
  message?: string;
  transactionHash?: string;
  resultMeta?: string;
  error?: string;
  rebuiltXdr?: string;
}

export interface GetStatusResponse {
  success: boolean;
  data?: {
    wallet: string;
    name?: string;
    surnames?: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'NOT_FOUND';
    verifiedAt?: string;
    submittedAt?: string;
    rejectedAt?: string;
    reason?: string;
  };
  error?: string;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export class BackendAPI {   
  static async buildRegisterTransaction(data: BuildRegisterTransactionDto): Promise<BuildRegisterTransactionResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/register/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async submitSignedTransaction(data: SubmitSignedTransactionDto): Promise<SubmitSignedTransactionResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/register/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getStatus(wallet: string): Promise<GetStatusResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/get-status/${wallet}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
