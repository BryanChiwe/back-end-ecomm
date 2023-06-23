import sgMail from '@sendgrid/mail';
sgMail.setApiKey('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')

const msg = {
    to: 'bryan@whitesoles.co', // Change to your recipient
    from: 'srxmax161@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, event with Node.js</strong>',
}

sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  })