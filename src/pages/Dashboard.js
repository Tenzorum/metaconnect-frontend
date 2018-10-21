import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import styled from "styled-components";
import Base from "../layouts/base";
import Card from "../components/Card";
import Icon from "../components/Icon";
import Column from "../components/Column";
import SocialMediaList from "../components/SocialMediaList";
import QRCodeScanner from "../components/QRCodeScanner";
import QRCodeDisplay from "../components/QRCodeDisplay";
import Loader from "../components/Loader";
import camera from "../assets/camera.svg";
import qrcode from "../assets/qrcode.svg";
import { responsive } from "../styles";
import { notificationShow } from "../reducers/_notification";
import { metaConnectionShow } from "../reducers/_metaConnection";
import {
  p2pRoomSendMessage,
  p2pRoomRegisterListeners
} from "../reducers/_p2pRoom";
import {
  formatHandle,
  handleMetaConnectionURI,
  generateNewMetaConnection
} from "../helpers/utilities";
import { colors, transitions } from "../styles";

const StyledWrapper = styled(Column)`
  padding: 20px;
  height: 100%;
  min-height: 100vh;
  @media screen and (${responsive.sm.max}) {
    padding: 20px 0;
    padding-top: 50px;
  }
`;

const StyledQRCodeWrapper = styled(Column)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 360px;
`;

const StyledContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
`;

const StyledParagrah = styled.p`
  font-size: 20px;
  margin: 16px 0;
`;

const StyledMetaConnections = styled.div`
  display: flex;
  font-size: 52px;
  & span {
    font-size: 42px;
    line-height: 66px;
    margin: 0 8px;
  }
`;

const StyledProfile = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const StyledName = styled.h3`
  & span {
    margin-right: 12px;
  }
`;

const StyledMetaConnectionsListWrapper = styled.div`
  width: 100%;
  margin: 20px auto;
`;

const StyledMetaConnectionsList = styled.div``;

const StyledMetaConnectionsItem = styled.div`
  margin: 10px auto;
  text-align: left;
  cursor: pointer;
`;

const StyledMetaConnectionsEmpty = styled(StyledMetaConnectionsItem)`
  cursor: none;
`;

const StyledTabsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Icon)``;

const StyledTab = styled.div`
  transition: ${transitions.base};
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  margin: 4px;
  border-radius: 20px;
  border: ${({ active }) =>
    active
      ? `1px solid rgb(${colors.dark})`
      : `1px solid rgb(${colors.darkGrey})`};

  & ${StyledIcon} {
    background-color: ${({ active }) =>
      active ? `rgb(${colors.dark})` : `rgb(${colors.darkGrey})`};
  }

  & p {
    color: ${({ active }) =>
      active ? `rgb(${colors.dark})` : `rgb(${colors.darkGrey})`};
  }

  &:hover {
    border: 1px solid rgba(${colors.dark}, 0.7);

    & ${StyledIcon} {
      background-color: rgba(${colors.dark}, 0.7);
    }

    & p {
      color: rgba(${colors.dark}, 0.7);
    }
  }
`;

let baseUrl =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://" + window.location.host
    : "https://metaconnect.me";

class Dashboard extends Component {
  state = {
    scan: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.connected !== this.props.connected && this.props.connected) {
      const listeners = [
        {
          event: "message",
          callback: this.onMessage
        }
      ];
      this.props.p2pRoomRegisterListeners(listeners);
    }
  }

  onMessage = message => {
    let string = message.data.toString();
    if (string.trim()) {
      let json = null;
      try {
        json = JSON.parse(string);
      } catch (err) {
        throw new Error(err);
      }
      if (json) {
        const metaConnection = generateNewMetaConnection(json);
        this.openMetaConnection(metaConnection);
      }
    }
  };

  openMetaConnection(metaConnection) {
    this.props.metaConnectionShow(metaConnection);
    window.browserHistory.push("/meta-connection");
  }

  sendMetaConnection(peer) {
    const metaConnection = generateNewMetaConnection({
      name: this.props.name,
      socialMedia: this.props.socialMedia
    });
    this.sendMessage(peer, JSON.stringify(metaConnection));
  }

  toggleQRCodeScanner = () => this.setState({ scan: !this.state.scan });

  sendMessage = (peer, message) => {
    this.props.p2pRoomSendMessage(peer, message);
  };

  onQRCodeError = () => {
    this.props.notificationShow("Something went wrong!", true);
  };

  onQRCodeValidate = data => {
    let result = null;
    if (data.startsWith("http:") || data.startsWith("https:")) {
      result = data;
    }
    return { data, result, onError: this.onQRCodeError };
  };

  onQRCodeScan = string => {
    const result = handleMetaConnectionURI(string);
    if (result) {
      this.sendMetaConnection(result.peer);
      this.openMetaConnection(result.metaConnection);
    }
    this.toggleQRCodeScanner();
  };

  render() {
    const uri = `{${baseUrl}}?id=${this.props.userId}&name=${
      this.props.name
    }&socialMedia=${this.props.socialMedia}`;
    return (
      <Base>
        <StyledWrapper maxWidth={400}>
          <StyledProfile>
            <StyledName>
              <span>{`👩‍🚀`}</span>
              {`@${this.props.name}`}
            </StyledName>
            <SocialMediaList socialMedia={this.props.socialMedia} />
          </StyledProfile>
          <StyledContainer>
            <StyledMetaConnections>
              {Object.keys(this.props.metaConnections).length || 0}
              <span>{` ❤️`}</span>
            </StyledMetaConnections>
            <StyledParagrah>{`Scan to get more ❤️`}</StyledParagrah>
          </StyledContainer>
          <Card>
            <StyledTabsWrapper>
              <StyledTab
                active={!this.state.scan}
                onClick={this.toggleQRCodeScanner}
              >
                <StyledIcon
                  icon={qrcode}
                  size={20}
                  color={"dark"}
                  onClick={this.toggleQRCodeScanner}
                />
                <p>QR Code</p>
              </StyledTab>
              <StyledTab
                active={this.state.scan}
                onClick={this.toggleQRCodeScanner}
              >
                <StyledIcon
                  icon={camera}
                  size={20}
                  color={"dark"}
                  onClick={this.toggleQRCodeScanner}
                />
                <p>Scan</p>
              </StyledTab>
            </StyledTabsWrapper>
            <StyledQRCodeWrapper>
              {this.state.scan ? (
                <QRCodeScanner
                  onValidate={this.onQRCodeValidate}
                  onError={this.onQRCodeError}
                  onScan={this.onQRCodeScan}
                  onClose={this.toggleQRCodeScanner}
                />
              ) : this.props.connected && this.props.userId ? (
                <QRCodeDisplay data={uri} />
              ) : (
                <Loader color="dark" background="white" />
              )}
            </StyledQRCodeWrapper>
          </Card>
          <StyledMetaConnectionsListWrapper>
            <h2>Your MetaConnections</h2>
            {Object.keys(this.props.metaConnections).length ? (
              <StyledMetaConnectionsList>
                {Object.keys(this.props.metaConnections).map(key => (
                  <StyledMetaConnectionsItem
                    onClick={() => {
                      const metaConnection = {
                        request: false,
                        name: this.props.metaConnections[key].name,
                        socialMedia: this.props.metaConnections[key].socialMedia
                      };
                      this.openMetaConnection(metaConnection);
                    }}
                  >
                    {formatHandle(key)}
                  </StyledMetaConnectionsItem>
                ))}
              </StyledMetaConnectionsList>
            ) : (
              <StyledMetaConnectionsEmpty>
                {"Go make some MetaConnections"}
              </StyledMetaConnectionsEmpty>
            )}
          </StyledMetaConnectionsListWrapper>
        </StyledWrapper>
      </Base>
    );
  }
}

Dashboard.propTypes = {
  metaConnectionShow: PropTypes.func.isRequired,
  notificationShow: PropTypes.func.isRequired,
  p2pRoomSendMessage: PropTypes.func.isRequired,
  p2pRoomRegisterListeners: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  socialMedia: PropTypes.object.isRequired,
  metaConnections: PropTypes.object.isRequired,
  connected: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired
};

const reduxProps = ({ account, p2pRoom }) => ({
  name: account.name,
  socialMedia: account.socialMedia,
  metaConnections: account.metaConnections,
  connected: p2pRoom.connected,
  userId: p2pRoom.userId
});

export default connect(
  reduxProps,
  {
    metaConnectionShow,
    notificationShow,
    p2pRoomSendMessage,
    p2pRoomRegisterListeners
  }
)(Dashboard);
