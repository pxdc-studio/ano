const slugify = require("slugify");

exports.createTags = async function (tags, authorId) {
  let [newTags, existingTags] = tags.reduce(
    (output, item) => {
      item.id != null ? output[1].push(item) : output[0].push(item);
      return output;
    },
    [[], []]
  );

  let _tags = await Promise.all(
    newTags.map((tag) => {
      let payload = {
        name: tag.name,
        slug: slugify(tag.name, {
          replacement: "-",
          lower: true,
          strict: true,
        }),
        author: authorId,
      };
      return strapi
        .query("tags")
        .create(payload)
        .catch((e) => ({ error: e, payload: payload }));
    })
  );

  let valid = _tags.filter((result) => result.error == null);
  let errors = _tags.filter((result) => result.error instanceof Error);

  if (valid && valid.length > 0) {
    existingTags = existingTags.concat(valid);
  }

  let __tags_taken_during_adding = await strapi
    .query("tags")
    .find({ slug_in: errors.map((item) => item.payload.slug) });

  existingTags = existingTags.concat(__tags_taken_during_adding);

  return existingTags;
};

// exports.createResources = async function (input_resources, authorId) {
//   if (!input_resources || (input_resources && input_resources.length < 1)) {
//     return;
//   }

//   let resources = [];
//   let resources_to_insert = [];

//   for (var i = 0; i < input_resources.length; i++) {
//     let item = input_resources[i];
//     if (typeof item == "object") {
//       resources_to_insert.push(item);
//     } else {
//       resources.push(item);
//     }
//   }

//   async function create() {
//     if (resources_to_insert.length > 0) {
//       const exist_resources = await strapi.query("resources").find({
//         url_in: resources_to_insert.map((r) => r.url),
//       });

//       resources = resources.concat(exist_resources.map((e) => e.id));

//       resources_to_insert = resources_to_insert.filter(
//         (item) => !exist_resources.map((e) => e.url).includes(item.url)
//       );
//       resources_to_insert.map(async (r) => {
//         return await strapi
//           .query("resources")
//           .create({ slug: r.slug, url: r.url, author: authorId });
//       });

//       let inserted_tags = await Promise.all(resources_to_insert);

//       //Retrieve new id for tags (this is really bad, but this api return no ID when insert)
//       const new_resources = await strapi.query("resources").find({
//         url_in: inserted_tags.map((r) => r.url),
//       });

//       resources = resources.concat(new_resources.map((e) => e.id));
//     }

//     return resources;
//   }

//   await create();

//   return resources;
// };

// exports.createSynonyms = async function (input_synonyms, authorId) {
//   if (!input_synonyms || (input_synonyms && input_synonyms.length < 1)) {
//     return;
//   }

//   let synonyms = [];
//   let synonyms_to_insert = [];

//   for (var i = 0; i < input_synonyms.length; i++) {
//     let item = input_synonyms[i];
//     if (typeof item == "object") {
//       synonyms_to_insert.push(item);
//     } else {
//       synonyms.push(item);
//     }
//   }

//   async function create() {
//     if (synonyms_to_insert.length > 0) {
//       const exist_synonyms = await strapi.query("synonyms").find({
//         slug_in: synonyms_to_insert.map((r) =>
//           slugify(r.slug, {
//             replacement: "-",
//             lower: true,
//             strict: true,
//           })
//         ),
//       });

//       synonyms = synonyms.concat(exist_synonyms.map((e) => e.id));

//       synonyms_to_insert = synonyms_to_insert.filter(
//         (item) =>
//           !exist_synonyms
//             .map((e) => e.slug)
//             .includes(
//               slugify(item.slug, {
//                 replacement: "-",
//                 lower: true,
//                 strict: true,
//               })
//             )
//       );

//       synonyms_to_insert.map(async (r) => {
//         r.slug = slugify(r.slug, {
//           replacement: "-",
//           lower: true,
//           strict: true,
//         });

//         let exist_tags = await strapi.query("tags").find({
//           // convert non slug type to slug
//           slug_in: r.tags.map((tag) =>
//             slugify(tag, {
//               replacement: "-",
//               lower: true,
//               strict: true,
//             })
//           ),
//         });

//         exist_tags = exist_tags.map((tag) => tag.id);

//         return await strapi
//           .query("synonyms")
//           .create({ slug: r.slug, author: authorId, tags: exist_tags });
//       });

//       let inserted_tags = await Promise.all(synonyms_to_insert);

//       //Retrieve new id for tags (this is really bad, but this api return no ID when insert)
//       const new_synonyms = await strapi.query("synonyms").find({
//         slug_in: inserted_tags.map((r) => r.slug),
//       });

//       synonyms = synonyms.concat(new_synonyms.map((e) => e.id));
//     }

//     return synonyms;
//   }

//   await create();

//   return synonyms;
// };
