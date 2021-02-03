"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const { createTags, createResources, createSynonyms } = strapi.config.functions[
  "common"
];

const slugify = require("slugify");
const { result } = require("lodash");

module.exports = {
  async autocomplete(ctx) {
    let { slug } = ctx.params;

    slug = slug = slugify(slug, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    let raw = await strapi
      .query("synonyms")
      .model.query((q) => {
        q.where("synonyms.slug", "LIKE", `${slug}%`);
        q.orderBy("created_at", "desc");
      })
      .fetchAll();

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.synonyms })
    );
    return result;
  },
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { pageSize = 20, page = 0 } = ctx.query;

    let raw = await strapi
      .query("synonyms")
      .model.query((q) => {
        q.where("synonyms.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
        limit: pageSize,
        offset: page * pageSize,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.synonyms })
    );

    return {
      data: result,
      page: parseInt(page),
      totalCount: raw.pagination.rowCount,
    };
  },
  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id
    let { tags = [], name } = ctx.request.body;
    try {
      let slug = slugify(name, {
        replacement: "-",
        lower: true,
        strict: true,
      });

      let isExist = await strapi.query("synonyms").findOne({ slug: slug });

      if (isExist) {
        return {
          status: 304,
          message: "Synonym with the same name already exist",
        };
      }

      let existingTags = await createTags(tags, authorId);

      await strapi.query("synonyms").create({
        author: authorId,
        slug: slug,
        name: name,
        tags: existingTags.map((tag) => ({
          __component: "synonyms.tags",
          tag: {
            id: tag.id,
          },
        })),
      });

      return { status: 200, message: "Synonym added successfully" };
    } catch (e) {
      return { status: 400 };
    }
  },
  async delete(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id } = ctx.params;

    try {
      const isInUse = await strapi.query("announcements").findOne({
        synonyms: id,
      });

      if (isInUse) {
        return { status: 304, message: "Synonym is in use" }; // inuse
      }

      await strapi
        .query("synonyms")
        .model.query((q) => {
          q.where("author", authorId);
          q.andWhere("id", id);
        })
        .destroy();

      return { status: 200, message: "Synonym deleted Successfully" };
    } catch (e) {
      console.log(e);
      return { status: 400, message: "Unknow Error Deleting Synonyms" };
    }
  },
  async update(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id } = ctx.params;
    let { tags, name } = ctx.request.body;

    let slug = slugify(name, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    try {
      let isOwner = await strapi.query("synonyms").findOne({
        author: authorId,
        id: id,
      });

      if (!isOwner) {
        return {
          status: 304,
          message: "You have no permission to edit this Synonyms",
        };
      }

      let existingTags = await createTags(tags, authorId);

      await strapi.query("synonyms").update(
        { id: id },
        {
          slug: slug,
          name: name,
          tags: existingTags.map((tag) => ({
            __component: "synonyms.tags",
            tag: {
              id: tag.id,
            },
          })),
        }
      );

      return { status: 200, message: "Synonym Updated Successfully" };
    } catch (e) {
      console.log(e);
      return { status: 400 };
    }
  },
};
