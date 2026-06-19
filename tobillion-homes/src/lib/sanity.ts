import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getSanityProperties() {
  return sanityClient.fetch(`
    *[_type == "property" && status == "available"] | order(createdAt desc) {
      ...,
      neighborhood->,
      agent->
    }
  `);
}

export async function getSanityProperty(slug: string) {
  return sanityClient.fetch(
    `*[_type == "property" && slug.current == $slug][0] { ..., neighborhood->, agent-> }`,
    { slug }
  );
}

export async function getSanityBlogPosts() {
  return sanityClient.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      title,
      slug,
      excerpt,
      image,
      author,
      category,
      publishedAt,
      readTime
    }
  `);
}
