"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");
const { find } = require("../../tags/controllers/tags");
const { functions } = require("lodash");
const { all } = require("lodash/fp");

let { createTags, createResources, createSynonyms } = strapi.config.functions[
  "common"
];

module.exports = {
  async find(ctx) {
    let user = ctx.state.user;
    let authorId = user ? user.id : -1;
    let { pageSize = 5, page = 0 } = ctx.query;

    try {
      let allsubs = await strapi
        .query("subscriptions")
        .find({ author: authorId });

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

        const includes = item.includes.reduce(splitType, [[], [], []]);
        const excludes = item.excludes.reduce(splitType, [[], [], []]);
        let _and = [];

        // includes[0].length > 0 && _and.push({ synonyms_in: includes[0] });
        includes[1].length > 0 && _and.push({ tags_in: includes[1] });
        includes[2].length > 0 && _and.push({ author_in: includes[2] });

        // excludes[0].length > 0 && _and.push({ synonyms_nin: excludes[0] });
        excludes[1].length > 0 && _and.push({ tags_nin: excludes[1] });
        excludes[2].length > 0 && _and.push({ author_nin: excludes[2] });

        let includesTagFromSyn = tagsFromSynonyms.find((item) =>
          includes[0].includes(item.id)
        ); // find tags from synonym
        let excludesTagFromSyn = tagsFromSynonyms.find((item) =>
          excludes[0].includes(item.id)
        ); // find tags from synonym

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
      console.log(e);
      return { status: 400, message: "Unknow Error" };
    }
  },
  // async find(ctx) {
  //   try {
  //     let user = ctx.state.user;

  //     let { pageSize = 20, page = 0 } = ctx.query;

  //     let fromUser = user ? user.id : -1;

  //     let resSCHEMA = {
  //       data: [],
  //       page: 0,
  //       totalCount: 0,
  //     };

  //     let sub = await strapi
  //       .query("subscriptions")
  //       .findOne({ "user.id": fromUser });

  //     if (!sub) {
  //       return resSCHEMA;
  //     }

  //     let tagsFromSynonyms = await strapi
  //       .query("synonyms")
  //       .find({ slug_in: sub.synonyms.map((o) => o.synonym.slug) });

  //     // prepare tags into common standards
  //     // we can improve synonym to ignore author here
  //     let tags = sub.tags.concat(
  //       _.flatten(
  //         tagsFromSynonyms.map((synonym) =>
  //           synonym.tags.map((tag) => ({ tag: tag, exclude_authors: [] }))
  //         )
  //       )
  //     );

  //     let raw = await strapi
  //       .query("announcements")
  //       .model.query(function (q) {
  //         // left join is currently the only solution to produce complex query using knexjs,bookshelfjs type of ORM module
  //         q.leftJoin(
  //           "announcements__tags",
  //           "announcements.id",
  //           "announcements__tags.announcement_id"
  //         );

  //         q.leftJoin("tags", "announcements__tags.tag_id", "tags.id");

  //         q.where("announcements.author", "!=", fromUser);

  //         tags.forEach((node) => {
  //           q.orWhere(function () {
  //             let self = this.where("announcements__tags.tag_id", node.tag.id);

  //             if (node.exclude_authors && node.exclude_authors.length > 0) {
  //               self.andWhere(
  //                 "announcements.author",
  //                 "NOT IN",
  //                 node.exclude_authors.map((author) => author.id)
  //               );
  //             }
  //           });
  //         });

  //         sub.authors.forEach((node) => {
  //           q.orWhere(function () {
  //             let self = this.where("announcements.author", node.id);

  //             if (node.exclude_tags && node.exclude_tags.length > 0) {
  //               self.andWhere(
  //                 "tags.id",
  //                 "NOT IN",
  //                 node.exclude_tags.map((o) => o.id)
  //               );
  //             }
  //           });
  //         });

  //         q.orderBy("postdate", "desc");
  //       })
  //       .fetchPage({
  //         pageSize,
  //         page,
  //         limit: pageSize,
  //         offset: (page - 1) * pageSize,
  //         debug: true,
  //       });

  //     resSCHEMA = {
  //       data: raw.map((item) =>
  //         sanitizeEntity(item, { model: strapi.models.announcements })
  //       ),
  //       limit: parseInt(pageSize),
  //       offset: (page - 1) * pageSize,
  //     };

  //     return resSCHEMA;
  //   } catch (e) {
  //     console.error("get-sub-error", e);
  //     return;
  //   }
  // },
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
        resources: resources.map((r) => r.id),
        synonyms: synonyms.map((s) => s.id),
        postdate: new Date(),
        author: authorId,
      });

      return { status: 200, message: "Announcement Created Successful" };
    } catch (e) {
      console.log(e);
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
