interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;

  handler: (
    response: RazorpaySuccessResponse,
  ) => void | Promise<void>;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: Record<
    string,
    string
  >;

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayCheckoutInstance {
  open: () => void;

  on: (
    event: "payment.failed",
    callback: (
      response: RazorpayFailureResponse,
    ) => void,
  ) => void;
}

interface Window {
  Razorpay: new (
    options: RazorpayCheckoutOptions,
  ) => RazorpayCheckoutInstance;
}