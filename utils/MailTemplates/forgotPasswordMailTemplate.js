export const resetPassword = (otp) => {
   
    const imageUrl = '';
    const logoUrl = '';
   
    return `
    <html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #e8ebed;
            font-family: 'Poppins', sans-serif;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            width: 100%;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        .preheader {
            background-color: #e8ebed;
            padding: 16px 18px 8px;
            font-size: 0;
            color: transparent;
            display: none; /* Prevent showing in email preview */
        }
        .header {
            background-color: #ffffff;
            padding: 16px 0;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .body {
            padding: 30px 20px;
            text-align: center;
        }
        .body h1 {
            color: #2a2a2a;
            font-size: 30px;
            font-weight: 700;
            margin: 0 0 10px;
        }
        .body p {
            color: #5a5a5a;
            font-size: 16px;
            line-height: 1.5;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            background:  linear-gradient(to right, #7b3aec 0%, #af5ae7 100%);
            color:whitesmoke;
            padding: 16px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 20px;
            font-weight: 600;
            margin-top: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
          .logo{
              height:100px;
              width:300px;
            }
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
        .footer {
            background-color: #e8ebed;
            padding: 20px 15px;
            text-align: center;
            color: #8a8a8a;
            font-size: 12px;
        }
        .footer a {
            color: #6a11cb;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        /* Responsive Design */
        @media screen and (max-width: 600px) {
            .container {
                width: 100%;
                margin: 0;
            }
            .body h1 {
                font-size: 26px;
            }
            .body p {
                font-size: 14px;
            }
            .button {
                padding: 14px 28px;
                font-size: 18px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="preheader">
            <!-- Add optional preheader text for email preview -->
        </div>
        <div class="header">
        <img src="${imageUrl}" alt="OTP Image" />
        </div>
        <div class="body">
            <h1 class="heading">Forgot Your Password</h1>
            <p>Not to worry, we got you! Let's get you a new password.</p>
                    <a 
                href="#" 
                class="button" 
                style="
                  display: inline-block; 
                  background: linear-gradient(to right, #7b3aec 0%, #af5ae7 100%);
                  color: whitesmoke !important; 
                  padding: 14px 28px; 
                  border-radius: 50px; 
                  text-decoration: none; 
                  font-size: 18px; 
                  font-weight: 600; 
                  margin-top: 15px; 
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); 
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                ">
                <span>${otp}</span>
            </a>
        </div>
        <div class="footer">
            <img class="logo" src="${logoUrl}"  alt="Logo Image" />
            <p>&copy; PaarshEdu By <a href="#">PaarshEdu</a></p>
        </div>
    </div>
</body>
</html>

`;
}


