/*
 * Copyright (c) 2012 gskinner.com inc.
 * Authored by: Wes Gorgichuk
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * List of command types the server / client can send / receive.
 *
 *
 */
(function () {

	CommandTypes = {};
	var c = CommandTypes;

	/**
	 * Notifies the room when a user has joined.
	 *
	 */
	c.USER_JOINED_ROOM = 1;

	/**
	 * Message back to the user who just joined.
	 *
	 */
	c.JOIN = 2;

	/**
	 * Notify the room a user has left.
	 *
	 */
	c.USER_LEFT_ROOM = 3;

	/**
	 * Notify the room a user has changed a value.
	 *
	 */
	c.USER_CHANGE = 4;

	c.SET_VALUE = 5;

	c.ERROR = 6;

	c.JOIN_ROOM = 7;

	if (typeof exports == 'undefined') {
		exports = window;
	}
	exports.CommandTypes = CommandTypes;

}());