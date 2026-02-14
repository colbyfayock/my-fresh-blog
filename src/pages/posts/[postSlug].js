import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { getApolloClient } from 'lib/apollo-client';

import styles from '../../styles/Home.module.css'

export default function Post({ post, site }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{ post.title }</title>
        <meta name="description" content={`Read more about ${post.title} on ${site.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          { post.title }
        </h1>

        <div className={styles.grid}>
          <div className={styles.content} dangerouslySetInnerHTML={{
            __html: post.content
          }} />
        </div>

        <p className={styles.backToHome}>
          <Link href="/">
            &lt; Back to home
          </Link>
        </p>
      </main>
    </div>
  )
}

export async function getStaticProps({ params = {} } = {}) {
  const { postSlug } = params;

  const apolloClient = getApolloClient();

  let post = null;
  let site = { title: 'Space Jelly' };

  try {
    const data = await apolloClient.query({
      query: gql`
        query PostBySlug($slug: String!) {
          generalSettings {
            title
          }
          postBy(slug: $slug) {
            id
            content
            title
            slug
          }
        }
      `,
      variables: {
        slug: postSlug
      }
    });

    post = data?.data?.postBy || null;

    if (data?.data?.generalSettings) {
      site = {
        ...data.data.generalSettings
      };
    }
  } catch (error) {
    console.error('Error fetching post:', error.message);
  }

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post,
      site
    },
    revalidate: 86400
  }
}

export async function getStaticPaths() {
  const apolloClient = getApolloClient();

  let posts = [];

  try {
    const data = await apolloClient.query({
      query: gql`
        {
          posts(first: 10000) {
            edges {
              node {
                id
                title
                slug
              }
            }
          }
        }
      `,
    });

    if (data?.data?.posts?.edges) {
      posts = data.data.posts.edges.map(({ node }) => node);
    }
  } catch (error) {
    console.error('Error fetching post paths:', error.message);
  }

  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          postSlug: slug
        }
      }
    }),
    fallback: 'blocking'
  }
}