const { ApolloServer, gql } = require('apollo-server');
const { GiveFoodDataSource } = require('apollo-datasource-givefood');

const typeDefs = gql`
  type FoodBank {
    name: String
    slug: String
    address: String
    postcode: String
    country: String
    geo: Coordinates
    closed: Boolean
    phone: String
    email: String
    url: String
    shopping_list_url: String
    charity_number: Int
    charity_register_url: String
    network: String
    parliamentary_constituency: String
    district: String
    mp_party: String
    mp: String
    ward: String
    needs: [String]
    outlets: [Outlet]
  }

  type Organisation {
    name: String
    slug: String
    address: String
    postcode: String
    country: String
    geo: Coordinates
    closed: Boolean
    phone: String
    email: String
    url: String
    shopping_list_url: String
    charity_number: Int
    charity_register_url: String
    network: String
    parliamentary_constituency: String
    district: String
    mp_party: String
    mp: String
    ward: String
  }

  type Outlet {
    name: String
    address: String
    postcode: String
    parliamentary_constituency: String
    district: String
    mp_party: String
    mp: String
    ward: String
    geo: Coordinates
  }

  type NearbyOutlet {
    name: String
    slug: String
    address: String
    postcode: String
    country: String
    geo: Coordinates
    closed: Boolean
    phone: String
    email: String
    url: String
    shopping_list_url: String
    charity_number: Int
    charity_register_url: String
    network: String
    parliamentary_constituency: String
    district: String
    mp_party: String
    mp: String
    ward: String
    distance_mi: Float
    number_needs: Int
    needs: [String]
    need_id: String
    updated: String
    updated_text: String
  }

  type Coordinates {
    lat: Float
    lng: Float
  }

  input OrganisationInput {
    slug: String!
  }

  input SearchInput {
    lat: Float!
    lng: Float!
  }

  type Query {
    organisations: [Organisation]
    organisation(input: OrganisationInput!): FoodBank
    search(input: SearchInput!): [NearbyOutlet]
  }
`;

const formatLatLng = (latLng) => {
  const [lat, lng] = latLng ? latLng.split(',') : [null, null];

  return {
    lat,
    lng,
  };
};

const stripNewLines = (string) => string.split(/\r?\n/);

const resolvers = {
  Organisation: {
    geo: ({ latt_long }) => formatLatLng(latt_long),
  },
  Outlet: {
    geo: ({ latt_long }) => formatLatLng(latt_long),
  },
  FoodBank: {
    needs: ({ needs }) => stripNewLines(needs),
    outlets: ({ locations }) => locations,
  },
  NearbyOutlet: {
    geo: ({ latt_long }) => formatLatLng(latt_long),
    address: ({ address }) => stripNewLines(address).join(', '),
    needs: ({ needs }) => stripNewLines(needs),
  },
  Query: {
    organisations: async (_source, _args, { dataSources: { givefood } }) =>
      givefood.getAll(),
    organisation: async (
      _source,
      { input: { slug } },
      { dataSources: { givefood } }
    ) => givefood.getBySlug(slug),
    search: async (
      _source,
      { input: { lat, lng } },
      { dataSources: { givefood } }
    ) => givefood.getByLatLng(lat, lng),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    givefood: new GiveFoodDataSource(),
  }),
  introspection: true,
  playground: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
