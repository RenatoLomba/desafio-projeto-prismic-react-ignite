import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FaRegCalendar, FaUser, FaRegClock } from 'react-icons/fa';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { dateFormatter, timeFormatter } from '../../utils/dateFormatter';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute(
      'repo',
      // eslint-disable-next-line prettier/prettier
      'RenatoLomba/desafio-projeto-prismic-react-ignite',
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }, []);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      {router.isFallback ? (
        <div>Carregando...</div>
      ) : (
        <>
          <div
            className={styles.banner}
            style={{ backgroundImage: `url('${post.data.banner.url}')` }}
          />
          <main className={`${commonStyles.container} ${styles.content}`}>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <span>
                <FaRegCalendar />
                {dateFormatter(
                  // eslint-disable-next-line prettier/prettier
                  new Date(post.first_publication_date),
                )}
              </span>
              <span>
                <FaUser />
                {post.data.author}
              </span>
              <span>
                <FaRegClock />4 min
              </span>
            </div>
            {post.last_publication_date && (
              <div className={styles.lastUpdatedAt}>
                * editado em{' '}
                {dateFormatter(new Date(post.last_publication_date))}, às{' '}
                {timeFormatter(new Date(post.last_publication_date))}
              </div>
            )}
            <article>
              {/* eslint-disable-next-line prettier/prettier */}
              {post.data.content.map((content) => (
                <section key={`heading__${content.heading}`}>
                  <h2>{content.heading}</h2>
                  {/* eslint-disable-next-line prettier/prettier */}
                  {content.body.map((b) => (
                    <p key={`text__${b.text}`}>{b.text}</p>
                  ))}
                </section>
              ))}
            </article>
          </main>
          <div id="inject-comments-for-uterances" />
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  // eslint-disable-next-line prettier/prettier
  const paths = postsResponse.results.map((post) => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const slug = String(params.slug);

  const response = await prismic.getByUID('posts', slug, {});

  const nextPost = await prismic.query;

  const post: Post = { ...response };

  return {
    props: { post },
    revalidate: 60 * 60,
  };
};
