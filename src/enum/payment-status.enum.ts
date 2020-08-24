export enum PaymentStatus{

    // your payment has not yet been sent to the bank or credit card processor.

    Pending = 0,
    
    // your credit or debit card payment has been processed and accepted.
    Success = 1,
    
    // your checking, savings or other bank account payment has been processed and accepted.
    Complete = 2,
    
    // you stopped the payment before it was processed. For automatic recurring payments, all remaining payments were canceled.
    
    Canceled = 3,

    // your payment was not accepted when it was processed by the bank or credit card company. For information, contact the bank or credit card company. Do not contact Pay.gov.
    
    Rejected =4,
    
}