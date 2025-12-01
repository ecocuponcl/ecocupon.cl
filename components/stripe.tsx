"use client"

import { type ReactNode, useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

interface StripeProps {
  children: ReactNode
  options: {
    mode: "payment" | "subscription" | "setup"
    amount: number
    currency: string
  }
  className?: string
}

// This would be your actual publishable key in a real application
const stripePromise = loadStripe("pk_test_example")

export function Stripe({ children, options, className }: StripeProps) {
  const [clientSecret, setClientSecret] = useState<string>("")

  useEffect(() => {
    // In a real application, you would make an API call to your server
    // to create a PaymentIntent and get the client secret
    // For demo purposes, we're just setting a fake client secret
    setClientSecret("pi_example_secret_example")
  }, [options])

  if (!clientSecret) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <div className={className}>{children}</div>
    </Elements>
  )
}

