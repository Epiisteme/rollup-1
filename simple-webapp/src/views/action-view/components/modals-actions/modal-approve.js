import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button, Modal, Form, Icon,
} from 'semantic-ui-react';

import ModalError from '../modals-info/modal-error';
import ButtonGM from './gm-buttons';
import { handleApprove } from '../../../../state/tx/actions';
import { getWei } from '../../../../utils/utils';

const web3 = require('web3');

class ModalApprove extends Component {
    static propTypes = {
      config: PropTypes.object.isRequired,
      abiTokens: PropTypes.array.isRequired,
      modalApprove: PropTypes.bool.isRequired,
      toggleModalApprove: PropTypes.func.isRequired,
      handleApprove: PropTypes.func.isRequired,
      tokensA: PropTypes.string.isRequired,
      gasMultiplier: PropTypes.number.isRequired,
      desWallet: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);
      this.amountTokensRef = React.createRef();
      this.addressTokensRef = React.createRef();
      this.state = {
        modalError: false,
        error: '',
        disableButton: true,
      };
    }

    toggleModalError = () => { this.setState((prev) => ({ modalError: !prev.modalError })); }

    toggleModalClose = () => { this.props.toggleModalApprove(); this.setState({ disableButton: true }); }

    isLoadingTokensA = () => {
      try {
        return <p>{web3.utils.fromWei(this.props.tokensA, 'ether')}</p>;
      } catch (err) {
        return <p>0</p>;
      }
    }

    handleClickApprove = async () => {
      const {
        config, desWallet, gasMultiplier, abiTokens,
      } = this.props;
      const amountTokens = getWei(this.amountTokensRef.current.value);
      this.props.toggleModalApprove();
      this.setState({ disableButton: true });
      const res = await this.props.handleApprove(this.addressTokensRef.current.value, abiTokens, desWallet,
        amountTokens, config.address, config.nodeEth, gasMultiplier);
      if (res.message !== undefined) {
        if (res.message.includes('insufficient funds')) {
          this.setState({ error: '1' });
          this.toggleModalError();
        }
      }
    }

    checkAmount = (e) => {
      e.preventDefault();
      if (parseInt(e.target.value, 10)) {
        this.setState({ disableButton: false });
      } else {
        this.setState({ disableButton: true });
      }
    }

    render() {
      return (
        <div>
          <ModalError
            error={this.state.error}
            modalError={this.state.modalError}
            toggleModalError={this.toggleModalError} />
          <Modal open={this.props.modalApprove}>
            <Modal.Header>Approve Tokens</Modal.Header>
            <Modal.Content>
              <Form>
                <Form.Field>
                  <b>
                    Approved Tokens:
                  </b>
                  {this.isLoadingTokensA()}
                </Form.Field>
                <Form.Field>
                  <label htmlFor="amountToken">
                    Amount Tokens:
                    <input type="text" ref={this.amountTokensRef} onChange={this.checkAmount} id="amountToken" />
                  </label>
                </Form.Field>
                <Form.Field>
                  <label htmlFor="addressTokens">
                    Address SC Tokens:
                    <input
                      type="text"
                      disabled
                      placeholder="0x0000000000000000000000000000000000000000"
                      ref={this.addressTokensRef}
                      defaultValue={this.props.config.tokensAddress}
                      size="40" />
                  </label>
                </Form.Field>
                <Form.Field>
                  <ButtonGM />
                </Form.Field>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.handleClickApprove} color="blue" disabled={this.state.disableButton}>
                <Icon name="ethereum" />
                  APPROVE
              </Button>
              <Button color="grey" basic onClick={this.toggleModalClose}>
                <Icon name="close" />
                Close
              </Button>
            </Modal.Actions>
          </Modal>
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  config: state.general.config,
  abiTokens: state.general.abiTokens,
  desWallet: state.general.desWallet,
  tokensA: state.general.tokensA,
  gasMultiplier: state.general.gasMultiplier,
});

export default connect(mapStateToProps, { handleApprove })(ModalApprove);