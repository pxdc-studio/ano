"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");

let { createTags } = strapi.config.functions["common"];

module.exports = {
  async find(ctx) {
    let user = ctx.state.user;
    let authorId = user ? user.id : -1;
    let { pageSize = 5, page = 0 } = ctx.query;

    try {
      let allsubs = await strapi
        .query("subscriptions")
        .find({ author: authorId });

      // return early if no subs found
      if (allsubs.length == 0) {
        return {
          data: [],
          page: parseInt(page),
          totalCount: 0,
        };
      }

      /**
       * Collect all tags from both includes and excludes synonyms to build query later
       */
      let synonyms = allsubs.map((item) => {
        let synonyms = [];
        synonyms = synonyms.concat(
          item.includes.filter((i) => i.__component == "subscriptions.synonyms")
        );
        synonyms = synonyms.concat(
          item.excludes.filter((i) => i.__component == "subscriptions.synonyms")
        );
        return synonyms;
      });

      synonyms = _.flatten(synonyms).map((item) => item.synonym.id);

      let tagsFromSynonyms = await strapi
        .query("synonyms")
        .find({ id_in: synonyms });

      // Building or query for each subscriptions
      // each OR query is a subscription
      let or = allsubs.map((item) => {
        function splitType(output, i) {
          if (i.__component == "subscriptions.synonyms") {
            output[0].push(i.synonym.id);
          }
          if (i.__component == "subscriptions.tags") {
            output[1].push(i.tag.id);
          }
          if (i.__component == "subscriptions.authors") {
            output[2].push(i.author.id);
          }

          return output;
        }

        //includes list and excludes list is build in to and query
        //synonyms will make extra query to get tags and get add to include or exclude list of tags
        const includes = item.includes.reduce(splitType, [[], [], []]);
        const excludes = item.excludes.reduce(splitType, [[], [], []]);

        let _and = [];

        includes[1].length > 0 && _and.push({ tags_in: includes[1] });
        includes[2].length > 0 && _and.push({ author_in: includes[2] });

        excludes[1].length > 0 && _and.push({ tags_nin: excludes[1] });
        excludes[2].length > 0 && _and.push({ author_nin: excludes[2] });

        let includesTagFromSyn = tagsFromSynonyms.find((item) =>
          includes[0].includes(item.id)
        );
        let excludesTagFromSyn = tagsFromSynonyms.find((item) =>
          excludes[0].includes(item.id)
        );

        if (includesTagFromSyn) {
          _and.push({
            tags_in: includesTagFromSyn.tags.map((tag) => tag.tag.id),
          });
        }

        if (excludesTagFromSyn) {
          _and.push({
            tags_in: excludesTagFromSyn.tags.map((tag) => tag.tag.id),
          });
        }
        return _and;
      });

      let payload = {
        _where: {
          _or: or,
        },
        _limit: pageSize,
        _start: page * pageSize,
        _sort: "postdate:DESC",
      };

      let [count, raw] = await Promise.all([
        strapi.query("announcements").count(payload),
        strapi.query("announcements").find(payload),
      ]);

      let result = raw.map((item) =>
        sanitizeEntity(item, { model: strapi.models.announcements })
      );

      return {
        data: result,
        page: parseInt(page),
        totalCount: count,
      };
    } catch (e) {
      return { status: 400, message: "Unknow Error" };
    }
  },
  async findByOwner(ctx) {
    let user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    let { pageSize = 20, page = 0 } = ctx.query;

    let raw = await strapi
      .query("announcements")
      .model.query((q) => {
        q.where("author", authorId);
        q.orderBy("published_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
        limit: pageSize,
        offset: page * pageSize,
      });

    let result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.announcements })
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

    let {
      title,
      message,
      tags = [],
      resources = [],
      synonyms = [],
    } = ctx.request.body;

    try {
      let existingTags = await createTags(tags, authorId);

      await strapi.query("announcements").create({
        title: title,
        message: message,
        tags: existingTags,
        resources: resources.map((r) => r.id), //gather id only
        synonyms: synonyms.map((s) => s.id),
        postdate: new Date(),
        author: authorId,
      });

      return { status: 200, message: "Announcement Created Successful" };
    } catch (e) {
      return {
        status: 400,
        message: "Unknown Error While Creating Announcement",
      };
    }
  },
  async update(ctx) {
    try {
      let user = ctx.state.user;
      const authorId = user ? user.id : -1; // none reachable user id
      const { id } = ctx.params;

      let {
        title,
        message,
        tags = [],
        resources = [],
        synonyms = [],
        status = "active",
      } = ctx.request.body;

      let existingTags = await createTags(tags, authorId);
      await strapi.query("announcements").update(
        { id },
        {
          title,
          message,
          tags: existingTags,
          resources: resources.map((r) => r.id),
          synonyms: synonyms.map((s) => s.id),
          author: authorId,
          status,
        }
      );

      return { status: 200, message: "Updating Annoucement Successful" };
    } catch (e) {
      return { status: 400, message: "Unknownn Problem updating Annoucement" };
    }
  },
  async delete(ctx) {
    let { id } = ctx.params;

    if (!id) {
      return {
        status: 400,
        message: "Unknow Error While Deleting Announcement",
      };
    }

    let result = await strapi.query("announcements").delete({ id: id });

    return { status: 200, message: "Delete Announcement Successful" };
  },
};
