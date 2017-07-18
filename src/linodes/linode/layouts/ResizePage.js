import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Input,
  FormGroup,
  Form,
  FormSummary,
  Radio,
  SubmitButton,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { types } from '~/api';
import { resizeLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import Plan from '~/linodes/components/Plan';
import { planName } from '~/linodes/components/PlanStyle';

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

  renderTypes() {
    const groups = _.groupBy(Object.values(this.props.types.types), (t) =>
      t.class === 'nanode' ? 'standard' : t.class);

    const renderGroup = (group) => _.sortBy(group, 'hourly_price').map((type) => (
      <div key={type.id}>
        <Radio
          label={planName(type.label)}
          checked={this.state.type === type.id}
          onChange={() => this.setState({ type: type.id })}
        />
      </div>
    ));

    return (
      <div>
        <section>
          <radiogroup>
            <strong>Standard</strong>
            {renderGroup(groups.standard)}
          </radiogroup>
        </section>
        <radiogroup>
          <strong>High Memory</strong>
          {renderGroup(groups.highmem)}
        </radiogroup>
      </div>
    );
  }

  render() {
    const { types, linode: { type: { id: currentType } } } = this.props;
    const { type, errors, loading } = this.state;

    const currentPlan = types.types[currentType];

    return (
      <Card header={<CardHeader title="Resize" />}>
        <Form onSubmit={this.onSubmit}>
          <p>
            You will experience downtime while your Linode is shut down, migrated, and resized.
            We estimate it will take 18 minutes to migrated your Linode, but that may vary based on
            host and network load.
          </p>
          <p>
            The resized Linode will be billed at the hourly rate of the new Linode plan going forward.
          </p>
          <FormGroup className="row">
            <label className="col-sm-3 col-form-label">Current Plan</label>
            <div className="col-sm-9">
              <Input
                disabled
                value={currentPlan ? planName(currentPlan.label) : 'Unknown'}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <label className="col-sm-3 col-form-label">New Plan</label>
            <div className="col-sm-9">{this.renderTypes()}</div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-3 col-sm-9">
              <SubmitButton
                disabled={loading}
                disabledChildren="Resizing"
              >Resize</SubmitButton>
              <FormSummary errors={errors} success="Linode is being resized." />
            </div>
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
