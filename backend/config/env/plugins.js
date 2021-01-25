module.exports = ({ env }) => ({
  // ...
  email: {
    provider: 'mailtrap',
    providerOptions: {
      user: env('malikbasitmaqsood@gmail.com', 'default_user'),
      password: env('lifeisgood@123', 'default_pass')
    },
    settings: {
      defaultFrom: env('MAILTRAP_DEFAULT_FROM', 'malikbasitmaqsood@gmail.com'),
      defaultReplyTo: env('MAILTRAP_DEFAULT_REPLY_TO', ''),
    },
  }
  // ...
});