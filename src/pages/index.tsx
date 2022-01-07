import { useState } from 'react';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FaRegCalendar, FaUser } from 'react-icons/fa';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { dateFormatter } from '../utils/dateFormatter';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const fetchNextPosts = async () => {
    try {
      const response = await fetch(postsPagination.next_page);
      const data = await response.json();
      const newPostsPagination: PostPagination = {
        next_page: data.next_page,
        // eslint-disable-next-line prettier/prettier
        results: data.results.map((post) => ({
          ...post,
          first_publication_date: dateFormatter(
            // eslint-disable-next-line prettier/prettier
            new Date(post.first_publication_date),
          ),
        })),
      };
      setPosts([...posts, ...newPostsPagination.results]);
      setNextPage(newPostsPagination.next_page);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <div className={commonStyles.container}>
        <section className={styles.content}>
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={238.62}
            height={25.63}
          />

          <main>
            {/* eslint-disable-next-line prettier/prettier */}
            {posts.map((post) => (
              <Link href={`/post/${post.uid}`} passHref key={post.uid}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>

                  <div className={styles.info}>
                    <span>
                      <FaRegCalendar />
                      <span>
                        {dateFormatter(new Date(post.first_publication_date))}
                      </span>
                    </span>
                    <span>
                      <FaUser />
                      <span>{post.data.author}</span>
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </main>

          {nextPage && (
            <button onClick={fetchNextPosts} type="button">
              Carregar mais posts
            </button>
          )}
        </section>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    // eslint-disable-next-line prettier/prettier
    { fetch: ['posts.title', 'posts.subtitle', 'posts.author'], pageSize: 2 },
  );

  const postsPagination: PostPagination = {
    ...postsResponse,
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 60,
  };
};
