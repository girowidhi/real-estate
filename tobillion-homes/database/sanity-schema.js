// Sanity.io Schema Configuration
// Run `npx sanity init` in the project root to set up, then place files in /sanity/

export default {
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'price', title: 'Price (KES)', type: 'number' },
    { name: 'type', title: 'Property Type', type: 'string', options: { list: [{ title: 'House', value: 'house' }, { title: 'Apartment', value: 'apartment' }, { title: 'Land', value: 'land' }, { title: 'Commercial', value: 'commercial' }] } },
    { name: 'bedrooms', title: 'Bedrooms', type: 'number' },
    { name: 'bathrooms', title: 'Bathrooms', type: 'number' },
    { name: 'area', title: 'Area (sqm)', type: 'number' },
    { name: 'location', title: 'Location', type: 'string' },
    { name: 'neighborhood', title: 'Neighborhood', type: 'reference', to: [{ type: 'neighborhood' }] },
    { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] },
    { name: 'amenities', title: 'Amenities', type: 'array', of: [{ type: 'string' }] },
    { name: 'features', title: 'Features', type: 'array', of: [{ type: 'string' }] },
    { name: 'agent', title: 'Agent', type: 'reference', to: [{ type: 'agent' }] },
    { name: 'status', title: 'Status', type: 'string', options: { list: [{ title: 'Available', value: 'available' }, { title: 'Sold', value: 'sold' }, { title: 'Pending', value: 'pending' }, { title: 'Coming Soon', value: 'coming-soon' }] } },
    { name: 'featured', title: 'Featured', type: 'boolean' },
    { name: 'verified', title: 'Verified', type: 'boolean' },
    { name: 'yearBuilt', title: 'Year Built', type: 'number' },
    { name: 'latitude', title: 'Latitude', type: 'number' },
    { name: 'longitude', title: 'Longitude', type: 'number' },
  ],
  preview: {
    select: { title: 'title', media: 'images[0]', subtitle: 'neighborhood.name' },
  },
};
