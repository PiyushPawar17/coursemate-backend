# Contributing Guidelines

## Setup

-   Fork Repository.

-   Clone Repository.

```sh
git clone https://github.com/{Your_Username}/coursemate-backend.git
cd coursemate-backend
```

-   Install dependencies

```sh
yarn
```

## Development

-   Create `.env` file at the root of the project.

```sh
NODE_ENV=development
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
COOKIE_KEY=
```

-   Run development server

```sh
yarn dev
```

## Testing

-   Create `.env.test` file at the root of the project.

```sh
NODE_ENV=test
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
COOKIE_KEY=
```

-   Run tests

```sh
yarn test
```

-   Watch tests

```sh
yarn test:watch
```

## Contributing

-   Have a look at the open issues. Pick an unassigned issue or create one.

-   Create a new branch and make changes.

-   Send a Pull Request after making changes.
