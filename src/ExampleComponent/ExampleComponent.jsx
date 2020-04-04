import React from 'react';
import styles from './styles.module.css';

const ExampleComponent = ({ text }) => (
  <div className={styles.test}>
    Example Component:
    {text}
  </div>
);

export default ExampleComponent;
