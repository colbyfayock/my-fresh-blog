import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { getApolloClient } from 'lib/apollo-client';

import styles from '../styles/Home.module.css'

export default function Home({ page, posts }) {
  const { title, description } = page;
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{title}</h1>

        <p className={styles.description}>{ description }</p>

        <ul className={styles.grid}>
          {posts && posts.length > 0 && posts.map(post => {
            return (
              <li key={post.slug} className={styles.card}>
                <Link href={post.path}>
                  <h3 dangerouslySetInnerHTML={{
                    __html: post.title
                  }} />
                </Link>
                <div dangerouslySetInnerHTML={{
                  __html: post.excerpt
                }} />
              </li>
            );
          })}

          {!posts || posts.length === 0 && (
            <li>
              <p>
                Oops, no posts found!
              </p>
            </li>
          )}
        </ul>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const apolloClient = getApolloClient();

  let posts = [];
  let page = {
    title: 'Space Jelly',
    description: 'Cosmic web dev tutorials that will shock you with joy!'
  };

  try {
    const data = await apolloClient.query({
      query: gql`
        {
          generalSettings {
            title
            description
          }
          posts(first: 10000) {
            edges {
              node {
                id
                excerpt
                title
                slug
              }
            }
          }
        }
      `,
    });

    if (data?.data?.posts?.edges) {
      posts = data.data.posts.edges.map(({ node }) => node).map(post => {
        return {
          ...post,
          path: `/posts/${post.slug}`
        }
      });
    }

    if (data?.data?.generalSettings) {
      page = {
        ...data.data.generalSettings
      };
    }
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }

  return {
    props: {
      page,
      posts
    },
    revalidate: 86400
  }
}
