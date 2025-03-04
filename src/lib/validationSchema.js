import * as Yup from 'yup';

export const signUpValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  referralCode: Yup.string().required('Referral code is required'),
  acceptTerms: Yup.boolean()
      .oneOf([true], "You must accept the Terms and Conditions.") // ✅ Validation
      .required("Required"),
});
