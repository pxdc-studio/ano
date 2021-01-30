"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");

let { createTags, createResources } = strapi.config.functions["common"];

module.exports = {
  async find(ctx) {
    try {
      let user = ctx.state.user;

      let fromUser = 0;

      let resSCHEMA = {
        data: [],
        page: 0,
        pageSize: 0,
        rowCount: 0,
        pageCount: 0,
      };

      let sub = await strapi.query("subscriptions").findOne({ "user.id": 1 });

      if (!sub) {
        return resSCHEMA;
      }

      let tagsFromSynonyms = await strapi
        .query("synonyms")
        .find({ slug_in: sub.synonyms.map((o) => o.synonym.slug) });

      // prepare tags into common standards
      // we can improve synonym to ignore author here
      let tags = sub.tags.concat(
        _.flatten(
          tagsFromSynonyms.map((synonym) =>
            synonym.tags.map((tag) => ({ tag: tag, exclude_authors: [] }))
          )
        )
      );

      let raw = await strapi
        .query("announcements")
        .model.query(function (q) {
          // left join is currently the only solution to produce complex query using knexjs,bookshelfjs type of ORM module
          q.leftJoin(
            "announcements__tags",
            "announcements.id",
            "announcements__tags.announcement_id"
          );

          q.leftJoin("tags", "announcements__tags.tag_id", "tags.id");

          q.where("announcements.author", "!=", fromUser);

          tags.forEach((node) => {
            q.orWhere(function () {
              let self = this.where("announcements__tags.tag_id", node.tag.id);

              if (node.exclude_authors && node.exclude_authors.length > 0) {
                self.andWhere(
                  "announcements.author",
                  "NOT IN",
                  node.exclude_authors.map((author) => author.id)
                );
              }
            });
          });

          sub.authors.forEach((node) => {
            q.orWhere(function () {
              let self = this.where("announcements.author", node.id);

              if (node.exclude_tags && node.exclude_tags.length > 0) {
                self.andWhere(
                  "tags.id",
                  "NOT IN",
                  node.exclude_tags.map((o) => o.id)
                );
              }
            });
          });

          q.orderBy("postdate", "desc");
        })
        .fetchPage({
          pageSize: 20,
          page: 1,
          debug: true,
        });

      resSCHEMA = {
        data: raw.map((item) =>
          sanitizeEntity(item, { model: strapi.models.announcements })
        ),
        ...raw.pagination,
      };

      return resSCHEMA;
    } catch (e) {
      console.error("get-sub-error", e);
      return;
    }
  },
  async findByOwner(ctx) {
    let user = ctx.state.user;
    let authorId = user;

    let { limit = 20, start = 0 } = ctx.query;

    let model = strapi.query("announcements");

    let raw = model.find({
      _start: start,
      _limit: limit,
      _sort: "published_at:desc",
      author: 1,
    });

    let count = model.count({ author: 1 });

    [raw, count] = await Promise.all([raw, count]);

    let result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.announcements })
    );

    return {
      start,
      limit,
      total: count,
      data: result,
    };
  },
  async create(ctx) {
    let user = ctx.state.user;
    let authorId = 1;

    let {
      title,
      message,
      tags: input_tags,
      resources: input_resources,
      synonyms,
    } = ctx.request.body;

    try {
      const [_tags, _resouces] = await Promise.all([
        createTags(input_tags, authorId),
        createResources(input_resources, authorId),
      ]);

      await strapi.query("announcements").create({
        title: title || "default",
        message: message || "default",
        tags: _tags,
        resources: _resouces,
        synonyms: synonyms,
        postdate: new Date(),
        author: 1,
      });

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
  async update(ctx) {
    let user = ctx.state.user;
    let authorId = 1;
    let { id } = ctx.params;

    if (!id) {
      return { status: 400 };
    }

    let isYourPost = await strapi
      .query("announcements")
      .find({ author: authorId, id: id });

    if (!isYourPost) {
      return { status: 400 };
    }

    let {
      title,
      message,
      tags: input_tags,
      resources: input_resources,
      synonyms,
    } = ctx.request.body;

    try {
      let [_tags, _resouces] = await Promise.all([
        createTags(input_tags, authorId),
        createResources(input_resources, authorId),
      ]);

      await strapi.query("announcements").update(
        { id: id },
        {
          ...(title && { title }),
          ...(message && { message }),
          tags: _tags,
          resources: _resouces,
          synonyms: synonyms,
          author: 1,
        }
      );

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
  async delete(ctx) {
    let { id } = ctx.params;

    if (!id) {
      return { status: 400 };
    }

    return await strapi.query("announcements").delete({ id: id });
  },
};
