import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../../../config/config';
import { NextResponse } from 'next/server';

// Simple UPI ID format validation regex
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export async function POST(req) {
  try {
    const { upiId } = await req.json();

    // Validate UPI ID format
    if (!upiId || !UPI_ID_REGEX.test(upiId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid UPI ID format. It should be like example@upi',
        },
        { status: 400 }
      );
    }

    // Create a contact
    const contactResponse = await fetch('https://api.razorpay.com/v1/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'customer',
        reference_id: `contact_${Date.now()}`,
        name: 'UPI Validation',
      }),
    });

    const contactData = await contactResponse.json();

    if (!contactResponse.ok) {
      throw new Error(contactData.error?.description || 'Failed to create contact');
    }

    // Create a fund account with the UPI ID
    const fundAccountResponse = await fetch('https://api.razorpay.com/v1/fund_accounts', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_id: contactData.id,
        account_type: 'vpa',
        vpa: {
          address: upiId,
        },
      }),
    });

    const fundAccountData = await fundAccountResponse.json();

    // Check if the fund account was created successfully
    if (fundAccountResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'UPI ID validated successfully',
        contact_id: contactData.id,
        fund_account_id: fundAccountData.id,
        account_type: fundAccountData.account_type,
        account_id: fundAccountData.account_id,
        customer_name: fundAccountData.vpa?.name || 'Account Holder',
        vpa: upiId,
      });
    }

    // Handle specific Razorpay error codes
    if (fundAccountData.error?.code === 'BAD_REQUEST_ERROR') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid UPI ID. Please check and try again.',
        },
        { status: 400 }
      );
    }
    if (fundAccountData.error?.code === 'GATEWAY_ERROR') {
      return NextResponse.json(
        {
          success: false,
          message: 'UPI gateway error. Please try again later.',
        },
        { status: 500 }
      );
    }
    // If the fund account creation failed for any other reason, return a generic error
    if (fundAccountData.error) {
      return NextResponse.json(
        {
          success: false,
          message: fundAccountData.error.description || 'Failed to validate UPI ID',
        },
        { status: 500 }
      );
    }

    // If the fund account creation failed, handle the error
    console.error('UPI validation error:', fundAccountData.error);

    // Handle specific Razorpay error codes
    let errorMessage = fundAccountData.error?.description || 'Invalid UPI ID';
    if (fundAccountData.error?.code === 'BAD_REQUEST_ERROR') {
      errorMessage = 'Invalid UPI ID. Please check and try again.';
    } else if (fundAccountData.error?.code === 'GATEWAY_ERROR') {
      errorMessage = 'UPI gateway error. Please try again later.';
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('UPI validation error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to validate UPI ID. Please try again later.',
      },
      { status: 500 }
    );
  }
}