Testbench of "Attacking Browser Extensions"
===========================================
In order to run this testbench you have to install the Python requirements from
the requirements.txt. It is advisable to use a Python virtualenv to isolate the
software packages from your distribution. Here are the required commands, which
only need a regular Linux user to run. They are intended to be run from the
directory you found this README in.


    # create the virtualenv (Ubuntu)
    virtualenv -p /usr/bin/python3 ./venv
    # activate the virtualenv
    source ./venv/bin/activate
    # install the requirements
    pip install -r requirements.txt


Now that you have installed the requirements, you can start the testbench. You
can use the "--help" flag to find out about all options, but in general starting
the script can be done like this:


    ./run.py chrome
    # or, if you would like to execute the Firefox test suite
    ./run.py firefox


Please be patient, as the script will create a temporary profile and start the
browser of your choice. If everything succeeded, you will see a test overview
page. Tests are started automatically and run in their own tab.


Known Compatibility
===================
Right now, the testbench only works on Linux.

Tested with:
    - Firefox 43.0
    - Firefox 44.0 with WebSockets disabled (pip uninstall eventlet)
    - Firefox 45.0.2
    - Chromium Version 47.0.2526.106 (64-bit)
    - Chromium Version 50.0.2661.75 (64-bit)

