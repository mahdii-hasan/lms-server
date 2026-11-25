const verificationEmailTemplate = (
  confirmationCode: string,
  name: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Verify Your Email</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      background: #f4f7fb;
      padding: 40px 0;
    "
  >

    <tr>
      <td align="center">

        <table
          width="420"
          cellpadding="0"
          cellspacing="0"
          style="
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          "
        >

          <!-- Header -->

          <tr>
            <td
              style="
                background: linear-gradient(
                  135deg,
                  #0066ff,
                  #3b9cff
                );
                padding: 25px;
                text-align: center;
              "
            >

              <h1
                style="
                  color: #ffffff;
                  font-size: 22px;
                  margin: 0;
                "
              >
                Verify Your Email
              </h1>

            </td>
          </tr>


          <!-- Body -->

          <tr>
            <td
              style="
                padding: 30px;
                color: #333333;
              "
            >

              <p
                style="
                  font-size: 14px;
                  margin-bottom: 20px;
                "
              >
                Hi <strong>${name}</strong>,
              </p>


              <p
                style="
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                Thanks for joining us! To complete your registration,
                please use the verification code below.
              </p>


              <!-- OTP BOX -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin: 25px 0;
                "
              >

                <tr>
                  <td
                    align="center"
                    style="
                      background: #f0f5ff;
                      border: 2px dashed #4a90ff;
                      border-radius: 8px;
                      padding: 18px;
                    "
                  >

                    <span
                      style="
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #123b70;
                      "
                    >
                      ${confirmationCode}
                    </span>

                  </td>
                </tr>

              </table>


              <p
                style="
                  font-size: 13px;
                  color: #555555;
                  line-height: 1.6;
                "
              >
                This verification code is valid for
                <strong>10 minutes</strong>.

                If you did not request this verification,
                no further action is needed.
              </p>


            </td>
          </tr>



          <!-- Footer -->

          <tr>

            <td
              style="
                border-top: 1px solid #eeeeee;
                padding: 18px;
                text-align: center;
                font-size: 12px;
                color: #999999;
              "
            >

              Need assistance?

              <a
                href="#"
                style="
                  color: #3182ce;
                  text-decoration: none;
                "
              >
                Contact Support
              </a>

            </td>

          </tr>


        </table>

      </td>
    </tr>

  </table>


</body>

</html>
`;
};


export default verificationEmailTemplate;