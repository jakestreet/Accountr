import { useState } from 'react'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import Modal from '@mui/material/Modal';
export default function HomePage() {
    const [openHelp, setOpenHelp] = useState(false);
    const handleOpenHelp = () => setOpenHelp(true);
    const handleCloseHelp = () => setOpenHelp(false);
    return (
        <div>
            <h1 className="text-center mt-3">Home Page Placeholder</h1>
            <div class="fixed-bottom">
                <MDBTooltip tag='a' placement="auto" title="Help">
                    <button type="button" class="btn btn-primary btn-floating" onClick={() => { handleOpenHelp() }}>?</button>
                </MDBTooltip>

                <Modal
                    open={openHelp}
                    onClose={handleOpenHelp}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div class="card">
                        <div class="card-body">
                            <dl class="row">
                                <dd class="col-sm-9">No Content</dd>
                            </dl>
                        </div>
                        <MDBBtn onClick={handleCloseHelp} className="d-md-flex m-auto mt-4" style={{ background: 'rgba(41,121,255,1)' }}>Close</MDBBtn>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
