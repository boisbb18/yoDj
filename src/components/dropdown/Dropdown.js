import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

class Dropdown extends React.Component {
    constructor(props) {
        super(props)
        this.dropdownRef = React.createRef()
        this.state = {
            listOpen: false,
            selected: 'Venue',
            headerTitle: 'Venue'
        }
        this.toggleList = this.toggleList.bind(this)
        this.clickOutside = this.clickOutside.bind(this)
        this.select = this.select.bind(this)
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.clickOutside)
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.clickOutside)
    }

    clickOutside(event) {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
            this.setState({
                listOpen: false
            })
        }
    }

    select(type) {
        this.setState({
            selected: type, headerTitle: type,
            listOpen: false
        })
        this.props.onChange(type)
    }

    toggleList() {
        this.setState(prevState => ({
            listOpen: !prevState.listOpen
        }))
    }

    render() {
        const {listOpen, headerTitle} = this.state
        return (
            <div className="Dropdown">
                <div className="Dropdown__wrapper" ref={this.dropdownRef}>
                <div className="Dropdown--header" onClick={this.toggleList}>
                    <div className="Dropdown--header-title">{headerTitle}</div>
                    <div className="Dropdown--icon">
                        {
                            listOpen
                            ? <FontAwesomeIcon icon="angle-up" />
                            : <FontAwesomeIcon icon="angle-down" />
                        }
                    </div>
                </div>
                <div className={`Dropdown__list${!listOpen ? ' Dropdown__list-hide' : ''}`}>
                        <div className="Dropdown--list-item" onClick={() => this.select('Venue')}>Venue</div>
                        <div className="Dropdown--list-item" onClick={() => this.select('Party')}>Party</div>
                </div>
            </div>
        </div>
        )
    }
}

export default Dropdown