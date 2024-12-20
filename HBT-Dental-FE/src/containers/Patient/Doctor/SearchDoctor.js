import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import '../Specialty/SearchSpecialty.scss';
import { getAllDoctors } from '../../../services/userService';

class SearchDoctor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataDoctor: [],
            keyword: ''
        }
    }
    async componentDidMount() {
        let res = await getAllDoctors();
        if (res && res.errCode === 0) {
            this.setState({
                dataDoctor: res.data
            })
        }
    }
    handleOnChangeInput = (event) => {
        this.setState({
            keyword: event.target.value
        })

    }
    handleSearchDoctor = (ketqua) => {
        this.state.dataDoctor.forEach((item) => {
            if (item.lastName.toLowerCase().indexOf(this.state.keyword.toLowerCase()) !== -1) {
                ketqua.push(item)
            }
        })
    }
    render() {

        let ketqua = []
        this.handleSearchDoctor(ketqua)

        return (
            <div className="search-specialty-container">
                <div className="search-header-container">
                    <div className="search-specialty-header">
                        <Link to={'/home'}><div className="icon"><i className="fas fa-long-arrow-alt-left"></i></div></Link>

                        <div className="search-specialty-header-name">Nha sĩ</div>
                    </div>
                    <div className="search-header">
                        <input onChange={(event) => this.handleOnChangeInput(event)} type="text" placeholder="Tìm kiếm nha sĩ" className="search-input" />
                    </div>
                </div>

                <div className="search-specialty-body">
                    {ketqua && ketqua.length > 0 &&
                        ketqua.map((item, index) => {
                            let fullname = `${item.firstName} ${item.lastName}`
                            let nameVi = item.positionData ? item.positionData.value_Vi : '';
                            return (
                                <Link to={`/detail-doctor/${item.id}`}>
                                    <div className="child-item" key={index}>
                                        <div className="child-item-bg" style={{ backgroundImage: `url(${item.image})` }}>

                                        </div>
                                        <div>
                                            <div className="child-item-name">{nameVi}, {fullname}</div>
                                            {item.Doctor_Infor && item.Doctor_Infor.specialtyData &&
                                                <div className="child-item-sub-name">{item.Doctor_Infor.specialtyData.name}</div>
                                            }
                                        </div>

                                    </div>
                                </Link>
                            )
                        })
                    }

                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchDoctor);
