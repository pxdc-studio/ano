module.exports = ({ env }) => ({
  // ...
  email: {
    provider: 'mailtrap',
    providerOptions: {
      user: "f460c250c63a3c",
      password: "5735e5c9ed56ca"
    },
    settings: {
      defaultFrom: env('MAILTRAP_DEFAULT_FROM', 'default@value.com'),
      defaultReplyTo: env('MAILTRAP_DEFAULT_REPLY_TO', 'default@value.com'),
    },
  }
  // ...
});