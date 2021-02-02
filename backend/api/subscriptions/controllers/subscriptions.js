"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const { autocomplete } = require("../../resources/controllers/resources");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const slugify = require("slugify");

module.exports = {
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;
    let raw = await strapi.query("subscriptions").findOne({
      user: authorId,
    });

    const result = sanitizeEntity(raw, { model: strapi.models.subscriptions });
    return result;
  },
  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;
    let { tags, authors, synonyms } = ctx.request.body;

    tags = tags.map((tag) => ({
      __component: "subscriptions.tags",
      tag: { id: tag.tag ? tag.tag.id : tag.id },
      exclude_authors: tag.exclude_authors
        ? tag.exclude_authors.map((ea) => ea.id)
        : [],
    }));

    authors = authors.map((data) => ({
      __component: "subscriptions.authors",
      author: {
        id: data.id,
      },
    }));

    synonyms = synonyms.map((data) => ({
      __component: "subscriptions.synonyms",
      synonym: {
        id: data.id,
      },
    }));

    try {
      await strapi.query("subscriptions").delete({ user: authorId });
      await strapi.query("subscriptions").create({
        user: authorId,
        tags: tags,
        authors: authors,
        synonyms: synonyms,
      });
      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
};
