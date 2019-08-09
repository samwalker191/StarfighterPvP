import React from "react";
import { closeModal, openModal } from "../actions/modals";
import { connect } from "react-redux";
import JoinRoomContainer from "./join_room_container";
import NextRoundContainer from "./next_round_container";
import CreateRoomContainer from "./create_room_container";
import DemoRoomContainer from "./demo_room_container";
import GameOverContainer from "./game_over_container";

function Modal({ modal, closeModal, openModal }) {
	if (!modal) {
		return null;
	}

	let component;
	switch (modal) {
		case "joinRoom":
			component = <JoinRoomContainer openModal={openModal} />;
			break;
		case "nextRound":
			component = <NextRoundContainer openModal={openModal} />;
			break;
		case "createRoom":
			component = <CreateRoomContainer openModal={openModal} />;
			break;
		// case 'gameOver':
		//     component = <GameOverContainer />;
		//     break;
		case "joinDemoRoom":
			component = <DemoRoomContainer />;
			break;
		default:
			return null;
	}
	return (
		<div className="modal-background" onClick={closeModal}>
			<div className="modal-child" onClick={e => e.stopPropagation()}>
				{component}
			</div>
		</div>
	);
}

const mapStateToProps = state => {
	return {
		modal: state.ui.modal
	};
};

const mapDispatchToProps = dispatch => {
	return {
		closeModal: () => dispatch(closeModal()),
		openModal: modal => dispatch(openModal(modal))
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Modal);
