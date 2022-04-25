import { randomArrayItemsFromInitialArray } from './patches'

/**
 * UPLOAD_BATCH_SIZE - initial batch size, can set from env
 *
 * @constant
 * @type { Number }
 * @default
 */

const UPLOAD_BATCH_SIZE = 25;

/**
 * FINISH_TIME_FOR_CALL_FINISH_LIFECYCLE_HOOK - the variable is used for the final use, if the process was completely
 *                                              correct, without errors, then in order for the user to see the final
 *                                              version of the progress, and after that the loader was cleared
 *
 * @constant
 * @type { Number }
 * @default
 */

const FINISH_TIME_FOR_CALL_FINISH_LIFECYCLE_HOOK = 300;

/**
 * enum constant - PROGRESS_ACTION_MODE_ENUM
 *
 * @constant
 * @type {{
 *  SEQUENTIAL_REQUESTS: String,
 *  SIMULTANEOUS_REQUESTS: String,
 *  BATCH_REQUESTS: String
 * }}
 * @default
 */

export const PROGRESS_ACTION_MODE_ENUM = {
  SEQUENTIAL_REQUESTS: 'SEQUENTIAL_REQUESTS',
  SIMULTANEOUS_REQUESTS: 'SIMULTANEOUS_REQUESTS',
  BATCH_REQUESTS: 'BATCH_REQUESTS'
}

/**
 * standard constant - progressEnumValuesArray
 *
 * @constant
 * @type {Array.<String>}}
 * @default
 */
const progressEnumValuesArray = Object.values(PROGRESS_ACTION_MODE_ENUM);

export const progressActionMixin = {
  /**
   *
   * @return {{
      isProgressUnits: Boolean,
      itemsToProgress: Number,
      itemsStarted: Number,
      itemsDone: Number,
      itemsDoneWithError: Number,
      itemsCount: Number,
      batchSize: UPLOAD_BATCH_SIZE
    }}
   */

  data() {
    return {
      isProgressUnits: false,
      itemsToProgress: 0,
      itemsStarted: 0,
      itemsDone: 0,
      itemsDoneWithError: 0,
      itemsCount: 0,
      batchSize: UPLOAD_BATCH_SIZE,
      FINISH_TIME_FOR_CALL_FINISH_LIFECYCLE_HOOK
    }
  },
  computed: {
    /**
     * public computed - $progressStarted
     *
     * info - there is a calculation of the percentage of elements that have started work relative to all elements
     *
     * @return { number } percent (%)
     */

    $progressStarted() {
      return this.itemsToProgress
        ? (this.itemsStarted * 100) / this.itemsCount
        : 0
    },

    /**
     * public computed - $progressCompleted
     *
     * info - there is a calculation of the percentage of elements that have finished work relative to all elements
     *
     * @return { number } percent (%)
     */

    $progressCompleted() {
      return this.itemsToProgress ? (this.itemsDone * 100) / this.itemsCount : 0
    },

    /**
     * public abstract computed - $abstractActionsArray
     *
     * info - should be return array elements for requests($abstractAsyncProgressActions)
     *
     * @return { Array }
     */

    $abstractActionsArray: () => {
      throw new Error(
        'Abstract method error: You must implement $abstractActionsArray method in your component'
      )
    }
  },
  methods: {
    //  --------- START ---------- PATCH BLOCK -------------------
    // info - block used to add needed format an array of elements, before the stage of generating requests

    /**
     *
     * private method - _patchAsRandomArray
     *
     * info - used to create the effect of not sequential loading of elements, but scattered
     */

    _patchAsRandomArray: randomArrayItemsFromInitialArray,

    // --------- END ---------- PATCH BLOCK -------------------

    // --------- START ---------- MODE HANDLER BLOCK -------------------
    // info - block used for adding different mode

    /**
     * private method - _progressStartSequential
     *
     * info - call when we stated progress bar, used for SEQUENTIAL_REQUESTS mode, used loop for sequent request
     *        and for each iteration call $abstractAsyncProgressActions with options, if got error will call
     *        $handleProgressActionError, if success we will start $abstractHandleProgressActionSuccess with options
     *
     * @param array { Array.< any > }
     * @param options { Object }
     * @return { Promise<void> }
     * @private
     */

    async _progressStartSequential(array, options) {
      this.itemsToProgress = this.$abstractActionsArray.length;
      for (const index in array) {
        const item = array[index]
        await this._requestImitation(
          item,
          options,
          index,
          PROGRESS_ACTION_MODE_ENUM.SEQUENTIAL_REQUESTS
        )
      }
    },

    /**
     * private method - _progressStartInfinite
     *
     * info - call when we stated progress bar, used for SIMULTANEOUS_REQUESTS mode, used loop for all request immediately
     *        and for each iteration call $abstractAsyncProgressActions with options, if got error will call
     *        $handleProgressActionError, if success we will start $abstractHandleProgressActionSuccess with options
     *
     * @param array { Array.< any > }
     * @param options { Object. < any > }
     * @return { Promise<void> }
     * @private
     */

    _progressStartSimultaneous(array, options) {
      this.itemsToProgress = array.length;

      array.map((item, index) =>
        this._requestImitation(
          item,
          options,
          index,
          PROGRESS_ACTION_MODE_ENUM.SIMULTANEOUS_REQUESTS
        )
      )
    },

    /**
     * private method - _progressStartInfinite
     *
     * info - call when we stated progress bar, used for (Infinite-Spite) node, we got splitted array
     *        and add new progress element(step effect), for each step we used loop and for each iteration call
     *        $abstractAsyncProgressActions with options, if got error will call $handleProgressActionError,
     *        if success we will start $abstractHandleProgressActionSuccess with options
     *
     * @param droppedArrayOfArray { Array.< any > }
     * @param options { Object. < any > }
     * @return { Promise<void> }
     * @private
     */

    async _progressStartInfiniteBySplitArray(droppedArrayOfArray, options) {
      for (const array of droppedArrayOfArray) {
        this.itemsToProgress += array.length
        const arrPromises = array.map((item, index) =>
          this._requestImitation(
            item,
            options,
            index,
            PROGRESS_ACTION_MODE_ENUM.BATCH_REQUESTS
          )
        );
        await Promise.all(arrPromises)
      }
    },

    // --------- END ---------- MODE HANDLER BLOCK -------------------

    // --------- START ---------- COMMON FUNCTION BLOCK -------------------
    // info - functional block, used for main functionality

    /**
     * private method - _requestImitation
     *
     * info - simulating the use of an asynchronous action by calling error or success notification hooks
     *
     * @param item {any}
     * @param options {any}
     * @param index {number}
     * @param processMode {string}
     * @return {Promise}
     * @private
     */

    async _requestImitation(item, options, index, processMode) {
      try {
        this.itemsStarted += 1;
        await this.$abstractAsyncProgressActions(item, options, index);
        this.itemsDone += 1;
        this.$abstractHandleProgressActionSuccess(item, processMode, index)
      } catch (e) {
        this.itemsDoneWithError += 1;
        this.$abstractHandleProgressActionError(e, processMode, item, index);
      }
    },

    /**
     * private method - _dropArrayActionsByBatchSize
     *
     * info - takes in the original array and divides it into equal parts (batch size)
     *
     * @param ListOfTheActions
     * @return {any[]}
     * @private
     */

    _dropArrayActionsByBatchSize(ListOfTheActions) {
      if (!Array.isArray(ListOfTheActions)) return [];

      const countForNestedArray = Math.ceil(
        ListOfTheActions.length / this.batchSize
      );

      return Array.from({ length: countForNestedArray }).map(
        (currentArray, currentIndex) => {
          const startIndex = !currentIndex ? 0 : this.batchSize * currentIndex;
          const endIndex = startIndex + this.batchSize;
          return ListOfTheActions.slice(startIndex, endIndex);
        }
      )
    },

    /**
     * private method - _handlerCheckIfFinishProcess
     *
     * info - checks that the number of completed elements matches the number of elements,
     *        which will indicate the completion of the progress bar.
     *        After good finish function, clear data for mixin and start finish handler $abstractFinishProgress
     *
     * @private
     */
    _handlerCheckIfFinishProcess() {
      if (
        this.itemsDone &&
        this.itemsCount &&
        this.itemsDone === this.itemsCount
      ) {
        setTimeout(() => {
          this.$abstractFinishProgress();
          this.$resetProgressAction();
        }, this.FINISH_TIME_FOR_CALL_FINISH_LIFECYCLE_HOOK)
      }
    },

    /**
     * private method - _handlerCheckIfFinishProcess
     *
     * info - checks that the number of completed and completed with error elements matches the number of elements,
     *        which will indicate the completion of the progress bar.
     *        After good finish function, start error handler $finishProgressWithErrors
     *
     * @private
     */
    _handlerCheckIfFinishProgressWithError() {
      if (
        (this.itemsDone || this.itemsDoneWithError) &&
        this.itemsCount &&
        this.itemsDone + this.itemsDoneWithError === this.itemsCount
      ) {
        this.$abstractFinishProgressWithErrors();
      }
    },

    /**
     * private method - _checkIfExistModeFromList
     *
     * info - check if value have exist mode and return this mode or return SEQUENTIAL_REQUESTS mode
     *
     * @private
     */
    _checkIfExistModeFromList: (value) =>
      progressEnumValuesArray.includes(value)
        ? value
        : PROGRESS_ACTION_MODE_ENUM.SEQUENTIAL_REQUESTS,

    // --------- END ---------- COMMON FUNCTION BLOCK -------------------

    // --------- START ---------- CAN USE WITHOUT CHANGE DATA -------------------
    // info block for open function for use
    /**
     * public method - $resetProgressAction
     *
     * info - stop progress bar and clear data to initial value
     *
     */
    $resetProgressAction() {
      this.isProgressUnits = false;
      this.itemsDone = 0;
      this.itemsStarted = 0;
      this.itemsCount = 0;
      this.itemsToProgress = 0;
      this.itemsDoneWithError = 0;
    },

    /**
     *
     * public method - $updateBatchSize
     *
     * info - update batch size from initial to custom
     *
     * @param value { Number }
     */

    $updateBatchSize(value) {
      if (typeof value !== 'number') {
        return;
      }
      this.batchSize = value;
    },

    /**
     *
     * public method - $progressStart
     *
     * info - used for start progress bar, can set different options for update standard flow
     *
     * @param { Object } options - object params for mixin
     * @param { Boolean } options.patchAsRandom
     * @param { String } options.progressMode
     * @return { any }
     */

    async $progressStart(options = {}) {
      if (typeof options !== 'object') {
        options = {}
      }

      options.progressMode = this._checkIfExistModeFromList(
        options.progressMode
      );

      let actionsArray = this.$abstractActionsArray;

      if (options.patchAsRandom) {
        actionsArray = this._patchAsRandomArray(actionsArray);
      }

      this.isProgressUnits = true;
      this.itemsCount = actionsArray.length;

      switch (options.progressMode) {
        case PROGRESS_ACTION_MODE_ENUM.SEQUENTIAL_REQUESTS:
          return await this._progressStartSequential(actionsArray, options);
        case PROGRESS_ACTION_MODE_ENUM.SIMULTANEOUS_REQUESTS:
          return await this._progressStartSimultaneous(actionsArray, options);
        case PROGRESS_ACTION_MODE_ENUM.BATCH_REQUESTS: {
          const droppedArrayOfArray = this._dropArrayActionsByBatchSize(
            actionsArray
          );
          return await this._progressStartInfiniteBySplitArray(
            droppedArrayOfArray,
            options
          );
        }
      }
    },
    // --------- END ---------- CAN USE WITHOUT CHANGE DATA -------------------

    // --------- START ---------- BLOCK ABSTRACT ELEMENTS -------------------

    /**
     * public method - $abstractHandleProgressActionError
     *
     * info - used as handle about some error for one iteration
     *
     * @param info { any }
     * @param mode { string }
     * @param item { any= }
     * @param index { number= }
     *
     */

    $abstractHandleProgressActionError: (info, mode, item, index) => {},

    /**
     * public method - $abstractHandleProgressActionSuccess
     *
     * info - used as handle about success for one iteration
     *
     * @param info { any }
     * @param mode { string }
     * @param index { number }
     */

    $abstractHandleProgressActionSuccess: (info, mode, index) => {},

    /**
     * public method - $abstractFinishProgress
     *
     * info - used as handle about finish progress
     *
     */

    $abstractFinishProgress: () => {},

    /**
     * public method - $abstractFinishProgressWithErrors
     *
     * info - used as handle about finish progress with errors
     *
     */

    $abstractFinishProgressWithErrors: () => {},

    /**
     *
     * public method - $abstractAsyncProgressActions
     *
     * info - used as main function for progress bar mixin, should be return Promise,
     *        this function call for one iteration with item, options, index
     *
     * @param dataItem { any }
     * @param options { Object.<any> }
     * @param index { number }
     * @return { Promise }
     */

    $abstractAsyncProgressActions: (dataItem, options, index) =>
      Promise.resolve()

    // --------- END ---------- BLOCK ABSTRACT ELEMENTS ------------------
  },
  watch: {
    /**
     *  static watch for method itemsDone,  for each change itemsDone will check finish process with status ok or error,
     *  will call corresponding handler
     */

    itemsDone() {
      this._handlerCheckIfFinishProcess()
      this._handlerCheckIfFinishProgressWithError()
    },

    /**
     *  static watch for method itemsDoneWithError, for each change _handlerCheckIfFinishProgressWithError will check
     *  finish process with status error, will call corresponding handler
     */

    itemsDoneWithError() {
      this._handlerCheckIfFinishProgressWithError()
    }
  }
}
