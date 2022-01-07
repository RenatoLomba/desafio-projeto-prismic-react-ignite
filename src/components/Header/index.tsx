import Image from 'next/image';
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.header}`}>
      <Link href="/" passHref>
        <a>
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={238.62}
            height={25.63}
          />
        </a>
      </Link>
    </header>
  );
}
