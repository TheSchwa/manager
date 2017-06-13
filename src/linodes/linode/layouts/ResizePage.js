import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, Form, SubmitButton, Input,
} from 'linode-components/forms';
import { planName } from '~/linodes/components/PlanStyle';

import { setSource } from '~/actions/source';
import { types } from '~/api';
import { resizeLinode } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import Plan from '~/linodes/components/Plan';

import { selectLinode } from '../utilities';


export class ResizePage extends Component {
  static async preload({ dispatch, getState }) {
    if (!getState().api.types.ids.length) {
      await dispatch(types.all());
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      type: props.linode.type.id,
      current: props.linode.type.id,
      errors: {},
      loading: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { type } = this.state;

    return dispatch(dispatchOrStoreErrors.apply(this, [
      [() => resizeLinode(linode.id, type)],
      ['type'],
    ]));
  }

  render() {
    const { types } = this.props;
    const { type, current, errors, loading } = this.state;
    const curStr = planName(types.types[current].label);

    return (
      <Card header={<CardHeader title="Resize" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup className="row">
            <label className="col-sm-3 col-form-label">Current Plan</label>
            <div className="col-sm-9">
              <Input disabled value={curStr} />
            </div>
          </FormGroup>
          <FormGroup>
            <Plan
              types={types.types}
              selected={type}
              current={current}
              onServiceSelected={type => this.setState({ type })}
            />
          </FormGroup>
          <FormGroup>
            <SubmitButton
              disabled={loading}
              disabledChildren="Resizing"
            >Resize</SubmitButton>
            <FormSummary errors={errors} success="Linode is being resized." />
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

ResizePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { types } = state.api;
  return { linode, types };
}

export default connect(select)(ResizePage);
