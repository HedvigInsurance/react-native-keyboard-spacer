/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  ViewPropTypes,
  Platform,
  StyleSheet
} from "react-native";

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0
  }
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200
  }
};

export default class KeyboardSpacer extends Component {
  static propTypes = {
    topSpacing: PropTypes.number,
    onToggle: PropTypes.func,
    style: ViewPropTypes.style
  };

  static defaultProps = {
    topSpacing: 0,
    restSpacing: 0,
    onToggle: () => null
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      keyboardSpace: props.restSpacing,
      isKeyboardOpened: false
    };
    this._listeners = null;
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
  }

  componentDidMount() {
    const updateListener =
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const resetListener =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";
    this._listeners = [
      Keyboard.addListener(updateListener, this.updateKeyboardSpace),
      Keyboard.addListener(resetListener, this.resetKeyboardSpace)
    ];
  }

  componentWillUnmount() {
    this._listeners.forEach(listener => listener.remove());
  }

  getKeyboardSpace(event) {
    // get updated on rotation
    const screenHeight = Dimensions.get("window").height;
    // when external physical keyboard is connected
    // event.endCoordinates.height still equals virtual keyboard height
    // however only the keyboard toolbar is showing if there should be one
    return screenHeight - event.endCoordinates.screenY;
  }

  updateKeyboardSpace(event) {
    if (!event.endCoordinates) {
      return;
    }

    let animationConfig = defaultAnimation;
    if (Platform.OS === "ios") {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    const rawKeyboardSpace = this.getKeyboardSpace(event);
    const keyboardSpace = rawKeyboardSpace + this.props.topSpacing;

    this.setState(
      {
        isResting: false,
        rawKeyboardSpace,
        keyboardSpace,
        isKeyboardOpened: true
      },
      this.props.onToggle(true, keyboardSpace)
    );
  }

  resetKeyboardSpace(event) {
    let animationConfig = defaultAnimation;
    if (Platform.OS === "ios") {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    const rawKeyboardSpace = this.getKeyboardSpace(event);
    const keyboardSpace =
      rawKeyboardSpace + this.props.restSpacing + this.props.topSpacing;

    this.setState(
      {
        isResting: true,
        rawKeyboardSpace,
        keyboardSpace,
        isKeyboardOpened: false
      },
      this.props.onToggle(false, keyboardSpace)
    );
  }

  componentWillUpdate(nextProps) {
    if (nextProps.topSpacing === this.props.topSpacing) {
      return;
    }

    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      }
    });

    if (this.state.isResting) {
      const keyboardSpace =
        this.state.rawKeyboardSpace +
        nextProps.restSpacing +
        nextProps.topSpacing;

      this.setState(
        {
          keyboardSpace
        },
        this.props.onToggle(false, keyboardSpace)
      );
    } else {
      const keyboardSpace = this.state.rawKeyboardSpace + nextProps.topSpacing;

      this.setState(
        {
          keyboardSpace
        },
        this.props.onToggle(false, keyboardSpace)
      );
    }
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          { height: this.state.keyboardSpace },
          this.props.style
        ]}
      />
    );
  }
}
