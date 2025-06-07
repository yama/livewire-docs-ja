import React from 'react';

const features = [
  {
    title: 'Feature 1',
    description: 'Description of Feature 1',
  },
  {
    title: 'Feature 2',
    description: 'Description of Feature 2',
  },
  {
    title: 'Feature 3',
    description: 'Description of Feature 3',
  },
];

function HomepageFeatures() {
  return (
    <section className="features">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div className="col col--4" key={index}>
              <div className="feature">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomepageFeatures;