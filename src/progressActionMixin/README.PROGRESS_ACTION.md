# Progress action mixin

##### PUBLIC Computed
####### automatic

```
  $progressStarted - returns the percentage of elements that have started work relative to all elements
  
  $progressCompleted - returns the percentage of elements that have finished work relative to all elements
  
```

####### need be implemented

```
  $abstractActionsArray -  array of requests to be performed. Implement this as a computed value in your own component (should be return array elements for requests "$abstractAsyncProgressActions")
```
 

##### PUBLIC method by types

###### Usage methods

```
  $resetProgressAction - stop progress bar and clear data to initial value
    $resetProgressAction()
  
  $updateBatchSize - update batch size from initial to custom
    $updateBatchSize(12)
  
  $progressStart - used for start progress bar, can set different options for update standard flow
    $progressStart({
      progressMode, - SEQUENTIAL_REQUESTS(by default), SIMULTANEOUS_REQUESTS, BATCH_REQUESTS
      patchAsRandom, - if you want what request doing randonly, set true (its life )
    })  
```

###### Abstract methods 
####### optional
```
  $abstractHandleProgressActionError - used as handle about some error for one iteration from loop, 
       private method _progressStart.... 
  
  $abstractHandleProgressActionSuccess - used as handle about success for one iteration from loop, 
      private method _progressStart.... 
  
  $abstractFinishProgress - used as handle about finish progress
  
  $abstractFinishProgressWithErrors - used as handle about finish progress with errors
```

####### important for implementation
```
 $abstractAsyncProgressActions - used as main function for progress bar mixin, should be return Promise,
      this function call for one iteration with item, options, index
```

##### Initial consts

```
  NUXT_UPLOAD_BATCH_SIZE - you can implement this variable in .env, by default 25 (element for split array)
  
  for example: if we use this data
    1 -  $abstractActionsArray => [] (length = 60)
         progressMode = BATCH_REQUESTS
         
         our original array will be split into
         3 subarrays
         1 - 25 elements
         2 - 25 elements
         3 - 10 elements
         
         and progress will be made step by step, load 25 after that start next 25, and last step 10
     
    2 - $abstractActionsArray => [] (length = 60)
         progressMode = BATCH_REQUESTS
         
         NUXT_UPLOAD_BATCH_SIZE = 10
         
         our original array will be split into
         6 subarrays
         
         1 - 10 elements
         2 - 10 elements
         3 - 10 elements
          ...
         6 - 10 elements
         
         and progress will be made step by step, load 10 after that start next 10, .... last step 10    
```

```
  NUXT_FINISH_TIME_FOR_CALL_FINISH_LIFECYCLE_HOOK - you can implement this variable in .env, by default 300 ms,
    used for finish loading whe will finish load last element, after 300 ms, will start $abstractFinishProgress
```


##### Info about mode 

```
 SEQUENTIAL_REQUESTS(by default) -  it will take our array, and sequentially execute queries, 1, 2,3, and so on, 
                                    not all at once, but sequentially.
  recommendation for usage - when we have not a lot of requests, but with big data
  
 SIMULTANEOUS_REQUESTS - then we take our original array of elements, and without breaking the elements into parts
  recommendation for usage - have a lot of requests with small data
 
 BATCH_REQUESTS - take an array and split it into parts, and load the elements in parts
  recommendation for usage - when we use different data and want to do actions in parts
```


#Example 

```vue
<template>
    <div>
      <v-progress-linear
         v-if="isProgressUnits"
         height="25"
         :background-color="itemsDoneWithError ? 'pink lighten-3' : ''"
         :color="'ukko-blue-selected'"
         stream
         :buffer-value="$progressStarted"
         :value="$progressCompleted"
       >
         {{ itemsDone }} / {{ itemsToProgress }}
       </v-progress-linear>  
       <button @click="submit">
            submit
       </button>
    </div>
</template>

<script>

import { progressActionMixin, PROGRESS_ACTION_MODE_ENUM } from '@/mixins/progressAction'

export default {
  mixins: [progressActionMixin],
  data:() => ({}),
  computed: {
    $abstractActionsArray() { // Should be return Array
      return []
    }
  },
  methods: {
    submit() {
      this.$progressStart({
        patchAsRandom: true,
        progressMode: PROGRESS_ACTION_MODE_ENUM.BATCH_REQUESTS // or another mode
      })
    },
    $abstractFinishProgress() {
     //  this.$refs.dialog.close()
     //  this.isLoading = false
    },
     $abstractFinishProgressWithErrors() {
     //  this.isLoading = false
     //   if (this.getWarningsIds.length) {
     //    this.setFieldsMode(DELETE_FIELDS_MODE_ENUM.DELETION_PROCESS_RESULT)
     //  }
     },
     $abstractHandleProgressActionSuccess(activeUnitItem) {
     // this.unitsStatus[activeUnitItem.id] = { save success for Item 
     //   actionType: 'success',
     //   type: 'success',
     //   icon: 'mdi-check',
     //   color: 'green'
     // }
     },
     $abstractHandleProgressActionError(err, progressModeName, activeUnitItem) { 
      // this.unitsStatus[activeUnitItem.id] ={   save error for Item 
      //   actionType: '',
      //   type: 'error',
      //   details: err,
      //   icon: 'mdi-window-close',
      //   color: 'red'
      // }
     },
     $abstractAsyncProgressActions(item) {
        // return request, Promise, or do function as async await
     }
  }
}
</script>

```