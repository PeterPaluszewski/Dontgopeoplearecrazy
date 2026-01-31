# Backpacking Game - Testing Guide

## Test Structure

This project uses Unity's Test Framework with NUnit for unit and integration testing.

### Test Organization

```
Assets/_Project/Tests/
├── EditMode/          # Fast, logic-only tests (no Unity runtime)
│   └── GlobeHelperTests.cs
└── PlayMode/          # Integration tests (with Unity runtime)
    ├── InventoryManagerTests.cs
    └── ResourceManagerTests.cs
```

## Running Tests

### In Unity Editor
1. Open **Window > General > Test Runner**
2. Select **EditMode** or **PlayMode** tab
3. Click **Run All** or select specific tests

### From Command Line
```bash
# Run all tests
Unity.exe -runTests -batchmode -projectPath . -testResults ./TestResults.xml

# Run only EditMode tests
Unity.exe -runTests -batchmode -projectPath . -testPlatform editmode -testResults ./TestResults.xml
```

## Test Types

### Edit Mode Tests
- **Fast execution** (no Unity engine startup)
- Perfect for **pure logic** and utility functions
- Use for: Math calculations, data transformations, helper functions
- Example: `GlobeHelperTests` tests coordinate conversions

### Play Mode Tests
- **Full Unity runtime** with GameObjects, Components, etc.
- Use for: MonoBehaviour logic, Unity API interactions
- Example: `InventoryManagerTests` tests component behavior
- Can use `[UnityTest]` with `IEnumerator` for multi-frame tests

## Writing Tests

### Basic Test Structure
```csharp
[Test]
public void MethodName_Condition_ExpectedResult()
{
    // Arrange - Set up test data
    var testData = CreateTestData();
    
    // Act - Execute the code being tested
    var result = MethodUnderTest(testData);
    
    // Assert - Verify the result
    Assert.AreEqual(expectedValue, result);
}
```

### Play Mode Test with Setup/Teardown
```csharp
private GameObject testObject;

[SetUp]
public void Setup()
{
    testObject = new GameObject("Test");
    testObject.AddComponent<YourComponent>();
}

[TearDown]
public void Teardown()
{
    Object.Destroy(testObject);
}

[Test]
public void YourTest()
{
    // Test uses testObject
}
```

### Multi-Frame Test
```csharp
[UnityTest]
public IEnumerator TestThatNeedsFrames()
{
    // Setup
    yield return null; // Wait one frame
    
    // Test async behavior
    Assert.IsTrue(condition);
}
```

## Test-Driven Development Workflow

### Red-Green-Refactor Cycle

1. **RED**: Write a failing test
```csharp
[Test]
public void AddLocation_ValidData_Success()
{
    // This test will fail initially
    var result = locationManager.AddLocation(testLocation);
    Assert.IsTrue(result);
}
```

2. **GREEN**: Write minimal code to pass
```csharp
public bool AddLocation(LocationData location)
{
    locations.Add(location);
    return true;
}
```

3. **REFACTOR**: Improve code quality
```csharp
public bool AddLocation(LocationData location)
{
    if (location == null) return false;
    if (locations.Contains(location)) return false;
    
    locations.Add(location);
    OnLocationAdded?.Invoke(location);
    return true;
}
```

### Best Practices

1. **Test Names**: Use descriptive names following pattern:
   - `MethodName_Scenario_ExpectedBehavior`
   - Example: `ConsumeFood_InsufficientAmount_ReturnsFalse`

2. **One Assert Per Test**: Focus each test on one behavior
   - Bad: Testing multiple unrelated things
   - Good: Separate tests for each behavior

3. **Arrange-Act-Assert**: Keep tests structured
   - **Arrange**: Set up test conditions
   - **Act**: Execute the code
   - **Assert**: Verify results

4. **Independent Tests**: Tests should not depend on each other
   - Use `[SetUp]` and `[TearDown]` for clean state
   - Don't rely on test execution order

5. **Fast Tests**: Keep tests quick to run
   - Use EditMode tests when possible
   - Mock dependencies instead of full integration

## Coverage Goals

- **Critical Systems**: 80%+ coverage
  - ResourceManager
  - InventoryManager
  - SaveManager
  
- **Utilities**: 90%+ coverage
  - GlobeHelper
  - Data conversions

- **UI**: Basic smoke tests
  - Button clicks work
  - Data displays correctly

## Example Test Cases

### Resource Management
- ✅ Add/consume resources
- ✅ Exceed max limits
- ✅ Insufficient resources
- ✅ Resource restoration

### Inventory System
- ✅ Add/remove items
- ✅ Item stacking
- ✅ Weight limits
- ✅ Consumable usage

### Location System
- 🔲 Add connected locations
- 🔲 Calculate travel distance
- 🔲 Visit location
- 🔲 Check reachability

### Save System
- 🔲 Save game data
- 🔲 Load game data
- 🔲 Delete save data
- 🔲 Version compatibility

## Next Steps

1. Run existing tests to verify setup
2. Add tests for LocationNode
3. Add tests for GlobeManager
4. Add tests for SaveManager
5. Add UI interaction tests

## Resources

- [Unity Test Framework Documentation](https://docs.unity3d.com/Packages/com.unity.test-framework@latest)
- [NUnit Documentation](https://docs.nunit.org/)
- [Test-Driven Development by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
