const slugify = require("slugify");

exports.createTags = async function (input_tags, authorId) {
  /**
   * Tags Cleanup
   * 1. Isolate object type tag for insertion
   * 2. Check if insertion tag existed
   * 3. Insert new tags
   */

  if (!input_tags || (input_tags && input_tags.length < 1)) {
    return;
  }

  let tags = [];
  let tags_to_insert = [];

  for (var i = 0; i < input_tags.length; i++) {
    let item = input_tags[i];
    if (typeof item == "object") {
      //slugify it to make sure its a slug
      item.slug = slugify(item.slug, {
        replacement: "-",
        lower: true,
        strict: true,
      });

      tags_to_insert.push(item);
    } else {
      tags.push(item);
    }
  }

  async function create() {
    if (tags_to_insert.length > 0) {
      const exist_tags = await strapi.query("tags").find({
        slug_in: tags_to_insert.map((tag) => tag.slug),
      });

      //Insert to tags list if tags already exist
      tags = tags.concat(exist_tags.map((e) => e.id));

      //Remove existing tags from insert list
      tags_to_insert = tags_to_insert.filter(
        (item) => !exist_tags.map((e) => e.slug).includes(item.slug)
      );

      //Create tag
      tags_to_insert.map(async (tag) => {
        return await strapi
          .query("tags")
          .create({ slug: tag.slug, author: authorId });
      });

      let inserted_tags = await Promise.all(tags_to_insert);

      //Retrieve new id for tags (this is really bad, but this api return no ID when insert)
      const new_tags = await strapi.query("tags").find({
        slug_in: inserted_tags.map((tag) => tag.slug),
      });

      tags = tags.concat(new_tags.map((e) => e.id));
    }
    return tags;
  }

  await create();

  return tags;
};

exports.createResources = async function (input_resources, authorId) {
  if (!input_resources || (input_resources && input_resources.length < 1)) {
    return;
  }

  let resources = [];
  let resources_to_insert = [];

  for (var i = 0; i < input_resources.length; i++) {
    let item = input_resources[i];
    if (typeof item == "object") {
      resources_to_insert.push(item);
    } else {
      resources.push(item);
    }
  }

  async function create() {
    if (resources_to_insert.length > 0) {
      const exist_resources = await strapi.query("resources").find({
        url_in: resources_to_insert.map((r) => r.url),
      });

      resources = resources.concat(exist_resources.map((e) => e.id));

      resources_to_insert = resources_to_insert.filter(
        (item) => !exist_resources.map((e) => e.url).includes(item.url)
      );

      resources_to_insert.map(async (r) => {
        return await strapi
          .query("resources")
          .create({ slug: r.slug, url: r.url, author: authorId });
      });

      let inserted_tags = await Promise.all(resources_to_insert);

      //Retrieve new id for tags (this is really bad, but this api return no ID when insert)
      const new_resources = await strapi.query("resources").find({
        url_in: inserted_tags.map((r) => r.url),
      });

      resources = resources.concat(new_resources.map((e) => e.id));
    }

    return resources;
  }

  await create();

  return resources;
};

exports.createSynonyms = async function (input_synonyms, authorId) {
  if (!input_synonyms || (input_synonyms && input_synonyms.length < 1)) {
    return;
  }

  let synonyms = [];
  let synonyms_to_insert = [];

  for (var i = 0; i < input_synonyms.length; i++) {
    let item = input_synonyms[i];
    if (typeof item == "object") {
      synonyms_to_insert.push(item);
    } else {
      synonyms.push(item);
    }
  }

  async function create() {
    if (synonyms_to_insert.length > 0) {
      const exist_synonyms = await strapi.query("synonyms").find({
        slug_in: synonyms_to_insert.map((r) =>
          slugify(r.slug, {
            replacement: "-",
            lower: true,
            strict: true,
          })
        ),
      });

      synonyms = synonyms.concat(exist_synonyms.map((e) => e.id));

      synonyms_to_insert = synonyms_to_insert.filter(
        (item) =>
          !exist_synonyms
            .map((e) => e.slug)
            .includes(
              slugify(item.slug, {
                replacement: "-",
                lower: true,
                strict: true,
              })
            )
      );

      synonyms_to_insert.map(async (r) => {
        r.slug = slugify(r.slug, {
          replacement: "-",
          lower: true,
          strict: true,
        });

        let exist_tags = await strapi.query("tags").find({
          // convert non slug type to slug
          slug_in: r.tags.map((tag) =>
            slugify(tag, {
              replacement: "-",
              lower: true,
              strict: true,
            })
          ),
        });

        exist_tags = exist_tags.map((tag) => tag.id);

        return await strapi
          .query("synonyms")
          .create({ slug: r.slug, author: authorId, tags: exist_tags });
      });

      let inserted_tags = await Promise.all(synonyms_to_insert);

      //Retrieve new id for tags (this is really bad, but this api return no ID when insert)
      const new_synonyms = await strapi.query("synonyms").find({
        slug_in: inserted_tags.map((r) => r.slug),
      });

      synonyms = synonyms.concat(new_synonyms.map((e) => e.id));
    }

    return synonyms;
  }

  await create();

  return synonyms;
};
