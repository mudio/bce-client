/**
 * Component - Footer Component
 *
 * @file Footer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Link} from 'react-router';
import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';

import styles from './Footer.css';

class Footer extends Component {
    static propTypes = {
        update: PropTypes.shape({
            version: PropTypes.string.isRequired,
            lastUpdateTime: PropTypes.string.isRequired,
            note: PropTypes.string.isRequired
        })
    }

    render() {
        const update = this.props.update;

        return (
            <div className={styles.container}>
                <div className={styles.left}>
                    <span className={styles.btn}>
                        <i className="fa fa-map-signs" />
                        {update.version}
                        <span className={styles.tip}>{update.note}</span>
                    </span>
                </div>
                <div className={styles.content} />
                <div className={styles.right}>
                    <span className={styles.btn}>
                        <Link to="/login" >
                            <i className="fa fa-lock" />
                        </Link>
                    </span>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const update = state.update;
    return {update};
}

export default connect(mapStateToProps)(Footer);
