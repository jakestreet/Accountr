import { useAuth } from "../contexts/AuthContext";

export default function RenderHelp() {
    const { currentPage } = useAuth();

    if (currentPage === "Dashboard")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">General Notifications:</dt>
                    <dd class="col-sm-9">View any pending notifications.</dd>
                    <dt class="col-sm-3">Financial Ratios:</dt>
                    <dd class="col-sm-9">
                        View your company's Financial Ratios. 
                        Green (good), yellow (borderline or warning range), and red (needs closer look.)
                    </dd>
                </dl>
            </div>
        )
    else if (currentPage === "Accounts")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">View accounts:</dt>
                    <dd class="col-sm-9">
                        All current accounts including, but not limited to, the
                        account time, account type, initial balance, and date added.
                    </dd>
                    <dt class="col-sm-3">Create account:</dt>
                    <dd class="col-sm-9">
                        Create a new account by using the Create New Account button
                        and inputting the required information.
                    </dd>
                    <dt class="col-sm-3">Edit and delete account:</dt>
                    <dd class="col-sm-9">
                        The Action functionality allows for easy editing and removal
                        of current accounts.
                    </dd>
                    <dt class="col-sm-3">Sort accounts:</dt>
                    <dd class="col-sm-9">
                        Accounts can be sorted by sub-categories (account name, date
                        added, etc) or the entire table can be filtered by specified
                        values, or by eliminating columns.
                    </dd>
                    <dt class="col-sm-3">Export account information:</dt>
                    <dd class="col-sm-9">
                        Export information by using the Export functionality, take
                        note that data can be filtered prior to exporting for a
                        personalized report.
                    </dd>
                    <dt class="col-sm-3">Tip:</dt>
                    <dd class="col-sm-9">
                        Make sure to refresh the page, by using the refresh button, to
                        view the most recent changes.
                    </dd>
                </dl>
            </div>
        )
    else if (currentPage === "Event Log")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">View event logs:</dt>
                    <dd class="col-sm-9">
                        Time stamp, ID, username, and actions are displayed.
                    </dd>
                    <dt class="col-sm-3">Actions:</dt>
                    <dd class="col-sm-9">
                        The Actions functionality tracks changes by saving before and
                        after pictures, which allows for a visual display of changes
                        made.
                    </dd>
                    <dt class="col-sm-3">Sorting event logs:</dt>
                    <dd class="col-sm-9">
                        Event logs can be sorted by ascending, descending, filtered by
                        specified values, and by the removal of columns.
                    </dd>
                    <dt class="col-sm-3">Tip:</dt>
                    <dd class="col-sm-9">
                        Make sure to refresh the page, by using the refresh button, to
                        view the most recent changes.
                    </dd>
                </dl>
            </div>
        )
    else if (currentPage === "Users")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">View users: </dt>
                    <dd class="col-sm-9">
                        All users with a description including, but not limited to,
                        the account time, account type, initial balance, and date
                        added. The search bar can also be used to quickly find a
                        specified value.
                    </dd>
                    <dt class="col-sm-3">Create users:</dt>
                    <dd class="col-sm-9">
                        Create a new user by using the Create New User button and
                        inputting the required information and credentials.
                    </dd>
                    <dt class="col-sm-3">Managing users:</dt>
                    <dd class="col-sm-9">
                        The Action functionality allows for easy access to edit,
                        suspend, disable, email, and edit current users.
                    </dd>
                    <dt class="col-sm-3">Email User:</dt>
                    <dd class="col-sm-9">
                        The Email functionality allows for emails to be sent to the
                        specified user. Include information in the subject and body,
                        and an email will be sent to the user's email address.
                    </dd>
                    <dt class="col-sm-3">Sort accounts:</dt>
                    <dd class="col-sm-9">
                        Accounts can be sorted by sub-categories (username, email,
                        role, status, etc) or the entire table can be filtered by
                        specified values, or by eliminating columns.
                    </dd>
                    <dt class="col-sm-3">Export account information:</dt>
                    <dd class="col-sm-9">
                        Export information by using the Export functionality. Take
                        note that data can be filtered prior to exporting for a
                        personalized report.
                    </dd>
                    <dt class="col-sm-3">Tip:</dt>
                    <dd class="col-sm-9">
                        Make sure to refresh the page, by using the refresh button, to
                        view the most recent changes.
                    </dd>
                </dl>
            </div>
        )
    else if (currentPage === "Journal")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">View journal entry:</dt>
                    <dd class="col-sm-9">
                        View any attached files.
                    </dd>
                    <dt class="col-sm-3">Create journal entry:</dt>
                    <dd class="col-sm-9">
                        Create a new journal entry by using the Create New Journal Entry button
                        and inputting the required information.
                    </dd>
                    <dt class="col-sm-3">Sort accounts:</dt>
                    <dd class="col-sm-9">
                        Journal entries can be sorted by sub-categories (account name, date
                        created, etc) or the entire table can be filtered by specified
                        values, or by eliminating columns.
                    </dd>
                    <dt class="col-sm-3">Tip:</dt>
                    <dd class="col-sm-9">
                        Make sure to refresh the page, by using the refresh button, to
                        view the most recent changes.
                    </dd>
                </dl>
            </div>
        )
    else if (currentPage === "Profile")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">View personal account information:</dt>
                    <dd class="col-sm-9">Profile picture, full name, email, address, date of birth, and password expiration date are displayed.</dd>
                </dl>
            </div>
        )
    else if (currentPage === "Edit Profile")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">Edit personal account information:</dt>
                    <dd class="col-sm-9">Profile picture, full name, address, and date of birth can be modified.</dd>
                </dl>
            </div>
        )

    else if (currentPage === "Documents")
        return (
            <div class="card-body">
                <dl class="row">
                    <dt class="col-sm-3">Generate Document:</dt>
                    <dd class="col-sm-9">Generate different printable PDF documents based on a selected date range.</dd>
                    <dt class="col-sm-3">Select Date Range:</dt>
                    <dd class="col-sm-9">Select a date range for which you want to view.</dd>
                    <dt class="col-sm-3">Tip:</dt>
                    <dd class="col-sm-9">Select a wide date range.</dd>
                </dl>
            </div>
        )

}