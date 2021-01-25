const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    const { to: sendTo, from: sendFrom } = ctx.request.body;

    try {
       await strapi.plugins['email'].services.email.send({
        to: sendTo,
        from: sendFrom,
        subject: 'Comment posted that contains a bad words',
        text: `
          The comment contain a bad words.

          Comment:
        `,
      });
      ctx.send({ message: 'Email sent' })
    } catch (err) {
      strapi.log.error(`Error sending email to ${sendTo}`, err)
      ctx.send({ error: 'Error sending email' })
    }
  },
};