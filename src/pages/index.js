import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';
import { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Livewire 日本語ドキュメント
        </Heading>
        <p className="hero__subtitle">Livewire公式ドキュメント日本語訳</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quickstart">
            ドキュメントを読む
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const history = useHistory();
  useEffect(() => {
    history.replace('/docs/quickstart');
  }, [history]);
  return null;
}
